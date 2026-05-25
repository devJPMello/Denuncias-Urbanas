import { resolveDenunciaImageUrl } from '../lib/mediaUrl';

// ── Denúncias (frontend model) ────────────────────────────────────────────────

export type ComplaintStatus   = 'open' | 'analysis' | 'resolved';
export type ComplaintCategory = 'buraco' | 'lixo' | 'iluminacao' | 'calcada' | 'vandalismo' | 'outros';

export interface Complaint {
  id:        string;
  category:  ComplaintCategory;
  address:   string;
  date:      string;       // formatted pt-BR date string
  status:    ComplaintStatus;
  image?:    string;
  lat?:      number;
  lng?:      number;
  description?: string;
  title?:    string;
}

// ── Backend API types (espelham o Prisma/NestJS) ──────────────────────────────

/** Status vindo do backend (enum Prisma em português). */
export type ApiStatus = 'aberto' | 'analise' | 'resolvido';

/** Categoria vinda do backend. */
export type ApiCategory = 'buraco' | 'lixo' | 'iluminacao' | 'calcada' | 'vandalismo' | 'outros';

/** Forma do objeto Denuncia retornado pelo backend. */
export interface ApiDenuncia {
  id:          string;
  titulo:      string;
  descricao:   string;
  categoria:   ApiCategory;
  endereco:    string;
  imagemUrl:   string | null;
  temImagem?:  boolean;
  status:      ApiStatus;
  lat:         number | null;
  lng:         number | null;
  autorId:     string;
  criadoEm:   string;   // ISO-8601 string
  atualizadoEm: string;
  autor?: {
    id:    string;
    nome:  string;
    email: string;
  };
}

/** Payload para criar uma nova denúncia. */
export interface CreateDenunciaPayload {
  titulo:    string;
  descricao: string;
  categoria: ApiCategory;
  endereco:  string;
  imagemFile?: File;
  lat?:      number;
  lng?:      number;
}

/** Payload para atualizar uma denúncia (admin). */
export interface UpdateDenunciaPayload {
  status?: ApiStatus;
  titulo?: string;
  descricao?: string;
  categoria?: ApiCategory;
  endereco?: string;
}

// ── Mappers ───────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<ApiStatus, ComplaintStatus> = {
  aberto:    'open',
  analise:   'analysis',
  resolvido: 'resolved',
};

const STATUS_MAP_REVERSE: Record<ComplaintStatus, ApiStatus> = {
  open:     'aberto',
  analysis: 'analise',
  resolved: 'resolvido',
};

/** Normaliza categorias do backend para o modelo frontend. */
function normalizeCategory(cat: ApiCategory): ComplaintCategory {
  return cat as ComplaintCategory;
}

/** Formata uma string ISO-8601 em data pt-BR (dd/mm/yyyy). */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR');
}

/** Converte um ApiDenuncia para o modelo frontend Complaint. */
export function mapApiDenuncia(d: ApiDenuncia): Complaint {
  return {
    id:          d.id,
    category:    normalizeCategory(d.categoria),
    address:     d.endereco,
    date:        formatDate(d.criadoEm),
    status:      STATUS_MAP[d.status] ?? 'open',
    image:       resolveDenunciaImageUrl(d.id, d.temImagem, d.imagemUrl),
    lat:         d.lat ?? undefined,
    lng:         d.lng ?? undefined,
    description: d.descricao,
    title:       d.titulo,
  };
}

export { STATUS_MAP, STATUS_MAP_REVERSE };

// ── Notificações in-app ───────────────────────────────────────────────────────

export interface AppNotification {
  id:          string;
  title:       string;
  body:        string;
  denunciaId:  string;
  receivedAt:  Date;
  read:        boolean;
}

// ── WebSocket payloads (espelham o backend) ───────────────────────────────────

export interface ComplaintUpdatedPayload {
  denunciaId: string;
  status:     string;
  updatedAt:  string;
}

export interface ComplaintCreatedPayload {
  denunciaId: string;
}

export interface NotificationNewPayload {
  title:      string;
  body:       string;
  denunciaId: string;
}

// ── PWA ───────────────────────────────────────────────────────────────────────

/** Evento não padronizado capturado antes da instalação do PWA. */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
