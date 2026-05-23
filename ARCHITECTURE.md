# Arquitetura — Denúncias Urbanas

## Visão Geral

```
[Cidadão PWA / Funcionário ]
         │  HTTPS
         ▼
    [Nginx :80]
    upstream least_conn
    WebSocket upgrade headers
         │
    ┌────┴────┐
    ▼         ▼
[api_1:3000] [api_2:3000]   ← NestJS (2 réplicas)
    │         │
    └────┬────┘
         │ PrismaClient
         ▼
   [PostgreSQL :5432]

    ┌────┴────┐
    ▼         ▼
[api_1]   [api_2]
    │         │
    └────┬────┘
         │ ioredis / BullMQ
         ▼
     [Redis :6379]
     (fila + pub/sub)

BullMQ Queues:
  complaint-assignment  → ComplaintAssignmentProcessor
  complaint-monitor     → ComplaintMonitorProcessor (repeat 30min)
  push-notifications    → PushNotificationProcessor

WebSocket:
  NotificationsGateway (socket.io) ← emitido pelos processors
```

---

## Fluxograma Geral

```mermaid
flowchart TD
    A[Cidadão abre PWA] --> B{Autenticado?}
    B -- Não --> C[LoginScreen]
    C --> D[POST /api/auth/login]
    D --> E[JWT retornado]
    E --> F[MapScreen]
    B -- Sim --> F

    F --> G[Criar Denúncia]
    G --> H[POST /api/denuncias]
    H --> I[(PostgreSQL\nDenúncia PENDENTE)]
    H --> J[BullMQ]

    J --> K[complaint-assignment job]
    J --> L[complaint-monitor job\nrepeat 30min]

    K --> M[Selecionar Funcionário disponível]
    M --> N[status → ATRIBUIDA]
    N --> O[push-notifications job]
    O --> P[Push ao Funcionário]
    N --> Q[Socket: complaint:updated]
    Q --> R[ReportDetailScreen atualiza em tempo real]

    L --> S{Status da denúncia?}
    S -- CONCLUIDA/REJEITADA --> T[Push ao Cidadão]
    T --> U[Encerrar repeat job]
    S -- Ativo há 24h+ sem update --> V[Escalar: push ao ADMIN]
    S -- Normal --> W[Aguardar próximo ciclo]
```

---

## Diagrama de Sequência — Ciclo Completo de uma Denúncia

```mermaid
sequenceDiagram
    participant C as Cidadão (PWA)
    participant N as Nginx
    participant API as NestJS API
    participant PG as PostgreSQL
    participant RD as Redis / BullMQ
    participant F as Funcionário (PWA)
    participant WS as WebSocket Gateway

    C->>N: POST /api/denuncias
    N->>API: proxy (least_conn)
    API->>PG: INSERT Denuncia (PENDENTE)
    API->>PG: INSERT Thread (PRINCIPAL)
    API->>PG: INSERT Thread (MONITOR)
    API->>RD: enqueue complaint-assignment
    API->>RD: enqueue complaint-monitor (repeat 30min)
    API-->>C: 201 { id, status: PENDENTE }

    RD-->>API: ComplaintAssignmentProcessor
    API->>PG: SELECT funcionario disponível
    API->>PG: UPDATE Denuncia → ATRIBUIDA
    API->>RD: enqueue push-notifications (para funcionário)
    API->>WS: emitComplaintUpdate(denunciaId, ATRIBUIDA)
    WS-->>C: complaint:updated { status: ATRIBUIDA }

    RD-->>API: PushNotificationProcessor
    API->>PG: SELECT PushSubscription do funcionário
    API->>F: Web Push notification

    F->>N: PATCH /api/denuncias/:id/status → EM_ANDAMENTO
    N->>API: proxy
    API->>PG: UPDATE Denuncia → EM_ANDAMENTO
    API->>WS: emitComplaintUpdate(denunciaId, EM_ANDAMENTO)
    WS-->>C: complaint:updated { status: EM_ANDAMENTO }

    F->>N: PATCH /api/denuncias/:id/status → CONCLUIDA
    N->>API: proxy
    API->>PG: UPDATE Denuncia → CONCLUIDA
    API->>WS: emitComplaintUpdate(denunciaId, CONCLUIDA)
    WS-->>C: complaint:updated { status: CONCLUIDA }

    Note over RD,API: Próximo ciclo do complaint-monitor
    RD-->>API: ComplaintMonitorProcessor
    API->>PG: SELECT Denuncia → CONCLUIDA
    API->>RD: enqueue push-notifications (para cidadão)
    API->>RD: remover repeat job do monitor
    RD-->>API: PushNotificationProcessor
    API->>PG: SELECT PushSubscription do cidadão
    API->>C: Web Push notification "Sua denúncia foi resolvida!"
```

---

## Diagrama de Estados

```mermaid
stateDiagram-v2
    [*] --> PENDENTE : Denúncia criada

    PENDENTE --> ATRIBUIDA : ComplaintAssignmentProcessor\n(funcionário selecionado)
    ATRIBUIDA --> EM_ANDAMENTO : Funcionário aceita\nPATCH /status
    EM_ANDAMENTO --> CONCLUIDA : Funcionário conclui\nPATCH /status
    EM_ANDAMENTO --> REJEITADA : Funcionário rejeita\nPATCH /status
    ATRIBUIDA --> REJEITADA : Funcionário rejeita\nPATCH /status

    CONCLUIDA --> [*]
    REJEITADA --> [*]

    note right of PENDENTE
        Thread MONITOR ativado
        (repeat job a cada 30min)
    end note

    note right of CONCLUIDA
        Thread MONITOR encerrado
        Push ao cidadão enviado
    end note
```

```mermaid
stateDiagram-v2
    state "Thread PRINCIPAL" as TP {
        [*] --> ATIVA : Job enfileirado
        ATIVA --> CONCLUIDA : Funcionário atribuído
    }

    state "Thread MONITOR" as TM {
        [*] --> ATIVA : Repeat job iniciado
        ATIVA --> ATIVA : 30min — status ainda ativo
        ATIVA --> CONCLUIDA : Denúncia CONCLUIDA/REJEITADA\ndetectada → job cancelado
    }
```

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS v4 |
| PWA | vite-plugin-pwa + Workbox |
| Real-time client | socket.io-client |
| Backend | NestJS 10 + TypeScript |
| ORM | Prisma + PostgreSQL 16 |
| Filas | BullMQ + Redis 7 |
| WebSockets | @nestjs/websockets + socket.io |
| Push | web-push (VAPID) |
| Auth | bcrypt + @nestjs/jwt + passport-jwt |
| Infra | Docker Compose + Nginx (least_conn load balancer) |

---

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL |
| `REDIS_URL` | URL do Redis |
| `JWT_SECRET` | Segredo para assinar JWTs |
| `VAPID_PUBLIC_KEY` | Chave pública VAPID para Web Push |
| `VAPID_PRIVATE_KEY` | Chave privada VAPID |
| `VAPID_EMAIL` | Email para o header VAPID |
| `VITE_API_URL` | URL base da API (frontend) |
| `VITE_VAPID_PUBLIC_KEY` | Chave pública VAPID exposta ao frontend |
