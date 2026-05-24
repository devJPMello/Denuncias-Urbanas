// ── Denúncias ─────────────────────────────────────────────────────────────────

export type ComplaintStatus   = 'open' | 'analysis' | 'resolved';
export type ComplaintCategory = 'buraco' | 'lixo' | 'iluminacao' | 'calcada' | 'outros';

export interface Complaint {
  id:        string;
  category:  ComplaintCategory;
  address:   string;
  date:      string;
  status:    ComplaintStatus;
  image?:    string;
  lat?:      number;
  lng?:      number;
}

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
