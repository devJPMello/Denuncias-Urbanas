# Denúncias Urbanas — Status do Projeto

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

## Arquitetura de Infraestrutura

```
[Cidadão / Funcionário PWA]
         │  HTTP/HTTPS
         ▼
    [Nginx :80]
    upstream least_conn + WebSocket upgrade
         │
    ┌────┴────┐
    ▼         ▼
[api_1:3000] [api_2:3000]   ← NestJS (2 réplicas)
    │         │
    └────┬────┘
         │ PrismaClient
         ▼
   [PostgreSQL :5432]
         │
     [Redis :6379]
   (BullMQ + pub/sub)
```

## Thread Architecture por Denúncia

```
POST /api/denuncias
         │
    ┌────┴────────────────────┐
    ▼                         ▼
Thread PRINCIPAL            Thread MONITOR
(complaint-assignment)     (complaint-monitor repeat/30min)
    │                         │
    ├─ atribuir funcionário   ├─ verifica status a cada 30min
    ├─ status → ATRIBUIDA     ├─ CONCLUIDA/REJEITADA → push cidadão
    ├─ push ao funcionário    └─ 24h sem update → escalar ao ADMIN
    └─ emit socket event
```

**Status:** `PENDENTE → ATRIBUIDA → EM_ANDAMENTO → CONCLUIDA | REJEITADA`

---

## Telas Implementadas (Frontend)

| Tela | Arquivo | Status |
|------|---------|--------|
| Splash Screen | `screens/SplashScreen.tsx` | ✅ Feito |
| Login Screen | `screens/LoginScreen.tsx` | ✅ Feito |
| Map Screen (cidadão) | `screens/MapScreen.tsx` | ✅ Feito |
| My Reports Screen | `screens/MyReportsScreen.tsx` | ✅ Feito |
| Report Detail Screen | `screens/ReportDetailScreen.tsx` | ✅ Feito |
| Profile Screen | `screens/ProfileScreen.tsx` | ✅ Feito |
| Settings Screen | `screens/SettingsScreen.tsx` | ✅ Feito |
| User Stats Screen | `screens/UserStatsScreen.tsx` | ✅ Feito |
| Admin Panel Screen | `screens/AdminPanelScreen.tsx` | ✅ Feito |
| Map Admin Screen | `screens/MapAdminScreen.tsx` | ✅ Feito |
| Reports Screen | `screens/ReportsScreen.tsx` | ✅ Feito |

---

## Épicos e Tasks

### ✅ Epic 1 — Documentação da Arquitetura

| Task | Descrição | Arquivo | Status |
|------|-----------|---------|--------|
| T1.1 | Fluxograma geral (Mermaid) | `ARCHITECTURE.md` | ✅ Feito |
| T1.2 | Diagrama de sequência do fluxo completo | `ARCHITECTURE.md` | ✅ Feito |
| T1.3 | Diagrama de estados (StatusDenuncia + Thread) | `ARCHITECTURE.md` | ✅ Feito |

---

### ✅ Epic 2 — Infraestrutura Docker + Nginx

| Task | Descrição | Arquivo | Status |
|------|-----------|---------|--------|
| T2.1 | Dockerfile backend (multi-stage build → run) | `backend/Dockerfile` | ✅ Feito |
| T2.2 | Dockerfile frontend (Vite build → nginx serve) | `frontend/Dockerfile` | ✅ Feito |
| T2.3 | docker-compose.yml (postgres, redis, api×2, nginx, frontend) | `docker-compose.yml` | ✅ Feito |
| T2.4 | nginx.conf (upstream round-robin, WebSocket upgrade) | `nginx/nginx.conf` | ✅ Feito |
| T2.5 | .env.example com todas as variáveis | `.env.example` | ✅ Feito |

---

### ⏳ Epic 3 — Backend: Banco de Dados (Prisma)

| Task | Descrição | Arquivo | Status |
|------|-----------|---------|--------|
| T3.1 | Instalar prisma, @prisma/client; criar schema.prisma | `backend/prisma/schema.prisma` | ⏳ Pendente |
| T3.2 | PrismaModule global (PrismaService) | `backend/src/prisma/` | ⏳ Pendente |
| T3.3 | Migration inicial | `backend/prisma/migrations/` | ⏳ Pendente |
| T3.4 | Reescrever DenunciasService com Prisma | `backend/src/modules/denuncias/` | ⏳ Pendente |
| T3.5 | Reescrever UsuariosService com Prisma | `backend/src/modules/usuarios/` | ⏳ Pendente |
| T3.6 | AuthService real: bcrypt + JWT | `backend/src/modules/auth/` | ⏳ Pendente |

**Packages:** `prisma`, `@prisma/client`, `bcrypt`, `@types/bcrypt`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `@types/passport-jwt`

---

### ⏳ Epic 4 — Backend: Filas (BullMQ)

| Task | Descrição | Arquivo | Status |
|------|-----------|---------|--------|
| T4.1 | Instalar bullmq, @nestjs/bullmq, ioredis; criar QueueModule | `backend/src/modules/queue/queue.module.ts` | ⏳ Pendente |
| T4.2 | Constantes das filas + interfaces dos jobs | `backend/src/modules/queue/queue.constants.ts` | ⏳ Pendente |
| T4.3 | ComplaintAssignmentProcessor | `processors/complaint-assignment.processor.ts` | ⏳ Pendente |
| T4.4 | ComplaintMonitorProcessor (repeat 30min) | `processors/complaint-monitor.processor.ts` | ⏳ Pendente |
| T4.5 | PushNotificationProcessor | `processors/push-notification.processor.ts` | ⏳ Pendente |
| T4.6 | DenunciasService: ao criar → enfileirar PRINCIPAL + MONITOR | `backend/src/modules/denuncias/denuncias.service.ts` | ⏳ Pendente |

**Packages:** `bullmq`, `@nestjs/bullmq`, `ioredis`

---

### ⏳ Epic 5 — Backend: WebSockets (Socket.io)

| Task | Descrição | Arquivo | Status |
|------|-----------|---------|--------|
| T5.1 | Instalar @nestjs/websockets, @nestjs/platform-socket.io, socket.io | `backend/package.json` | ⏳ Pendente |
| T5.2 | NotificationsGateway (`@WebSocketGateway`) | `backend/src/modules/notifications/notifications.gateway.ts` | ⏳ Pendente |
| T5.3 | NotificationsService: emitComplaintUpdate, emitToUser | `backend/src/modules/notifications/notifications.service.ts` | ⏳ Pendente |
| T5.4 | NotificationsModule global | `backend/src/modules/notifications/notifications.module.ts` | ⏳ Pendente |
| T5.5 | Injetar NotificationsService nos processors | processors existentes | ⏳ Pendente |

**Eventos:** `complaint:updated { denunciaId, status, updatedAt }` · `notification:new { title, body, denunciaId }`

---

### ⏳ Epic 6 — Backend: Push Notifications (web-push)

| Task | Descrição | Arquivo | Status |
|------|-----------|---------|--------|
| T6.1 | Instalar web-push; script gerar VAPID keys | `backend/src/scripts/generate-vapid.ts` | ⏳ Pendente |
| T6.2 | PushModule: `/push/subscribe`, `/push/unsubscribe`, `/push/vapid-public-key` | `backend/src/modules/push/` | ⏳ Pendente |
| T6.3 | PushService: saveSubscription, removeSubscription, sendToUser | `backend/src/modules/push/push.service.ts` | ⏳ Pendente |
| T6.4 | Exportar PushService globalmente | `backend/src/modules/push/push.module.ts` | ⏳ Pendente |

**Package:** `web-push`, `@types/web-push`

---

### ⏳ Epic 7 — Frontend: PWA

| Task | Descrição | Arquivo | Status |
|------|-----------|---------|--------|
| T7.1 | Instalar vite-plugin-pwa; configurar vite.config.ts | `frontend/vite.config.ts` | ⏳ Pendente |
| T7.2 | manifest.json (name, icons, theme_color, standalone) | `frontend/public/manifest.json` | ⏳ Pendente |
| T7.3 | Ícones PNG: 192×192, 512×512, maskable | `frontend/public/icons/` | ⏳ Pendente |
| T7.4 | Atualizar index.html (manifest link, theme-color, apple-touch-icon) | `frontend/index.html` | ⏳ Pendente |
| T7.5 | Service Worker: push handler, notificationclick, cache | `frontend/src/sw.ts` | ⏳ Pendente |
| T7.6 | useRegisterSW hook + UpdatePrompt component | `frontend/src/hooks/useRegisterSW.ts` | ⏳ Pendente |

**Package:** `vite-plugin-pwa`, `workbox-window`

---

### ⏳ Epic 8 — Frontend: Push Subscription Service

| Task | Descrição | Arquivo | Status |
|------|-----------|---------|--------|
| T8.1 | `api.ts`: cliente HTTP base (fetch wrapper, auth header) | `frontend/src/services/api.ts` | ⏳ Pendente |
| T8.2 | `pushService.ts`: requestPermission, subscribeUser, unsubscribeUser | `frontend/src/services/pushService.ts` | ⏳ Pendente |
| T8.3 | `useNotifications` hook: permissão, subscription, métodos | `frontend/src/hooks/useNotifications.ts` | ⏳ Pendente |
| T8.4 | Wiring SettingsScreen → useNotifications (toggles reais) | `frontend/src/components/screens/SettingsScreen.tsx` | ⏳ Pendente |

---

### ⏳ Epic 9 — Frontend: WebSocket Real-time

| Task | Descrição | Arquivo | Status |
|------|-----------|---------|--------|
| T9.1 | Instalar socket.io-client | `frontend/package.json` | ⏳ Pendente |
| T9.2 | `socketService.ts`: singleton socket.io client | `frontend/src/services/socketService.ts` | ⏳ Pendente |
| T9.3 | `useSocket` hook: subscribe/unsubscribe a eventos | `frontend/src/hooks/useSocket.ts` | ⏳ Pendente |
| T9.4 | `useRealTimeComplaint` hook: escuta `complaint:updated` | `frontend/src/hooks/useRealTimeComplaint.ts` | ⏳ Pendente |
| T9.5 | Wiring ReportDetailScreen → useRealTimeComplaint | `frontend/src/components/screens/ReportDetailScreen.tsx` | ⏳ Pendente |

---

### ⏳ Epic 10 — Componentes Reutilizáveis

| Task | Descrição | Arquivo | Status |
|------|-----------|---------|--------|
| T10.1 | `NotificationBell`: badge animado + dropdown live via socket | `frontend/src/components/NotificationBell.tsx` | ⏳ Pendente |
| T10.2 | `ConnectionStatus`: banner offline/online (PWA network) | `frontend/src/components/ConnectionStatus.tsx` | ⏳ Pendente |
| T10.3 | `InstallPWAPrompt`: captura beforeinstallprompt | `frontend/src/components/InstallPWAPrompt.tsx` | ⏳ Pendente |
| T10.4 | `src/types/index.ts`: tipos compartilhados | `frontend/src/types/index.ts` | ⏳ Pendente |
| T10.5 | Integrar componentes no App.tsx / MapScreen | `frontend/src/App.tsx` | ⏳ Pendente |

---

## Ordem de Implementação

```
Epic 1 ✅ │ Epic 2 ✅  (paralelos — sem dependências)
          │
          ▼
       Epic 3  (Prisma + Auth)
          │
       Epic 4  (BullMQ — depende do Prisma)
          │
       Epic 5  (WebSockets — depende do BullMQ para emit)
          │
       Epic 6  (Push — depende do Prisma para PushSubscription)
          │
       Epic 7  (PWA frontend)
          │
       Epic 8  (Push subscription frontend — depende de 7)
          │
       Epic 9  (WebSocket frontend — depende de 7)
          │
       Epic 10 (Componentes reutilizáveis — depende de 8 e 9)
```

---

## Verificação End-to-End

1. `docker compose up --build` — sobe toda a stack
2. Abre `http://localhost` → PWA installable no browser
3. Aceita permissão de notificações → subscription salva no banco
4. Cria denúncia → dois jobs aparecem no BullMQ
5. Monitor job detecta status change → push chega no browser do cidadão
6. Funcionário recebe push → abre app → atualiza status → websocket notifica cidadão em tempo real
7. Nginx balanceia: requisições alternando entre `api_1` e `api_2`
