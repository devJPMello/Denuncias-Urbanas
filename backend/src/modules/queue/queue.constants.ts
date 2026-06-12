// ── Nomes das filas ───────────────────────────────────────────────────────────
export const QUEUE_COMPLAINT_ASSIGNMENT = 'complaint-assignment';
export const QUEUE_COMPLAINT_MONITOR    = 'complaint-monitor';
export const QUEUE_PUSH_NOTIFICATION    = 'push-notification';

// ── Nomes dos jobs ────────────────────────────────────────────────────────────
export const JOB_ASSIGN_COMPLAINT    = 'assign-complaint';
export const JOB_MONITOR_COMPLAINTS  = 'monitor-complaints';
export const JOB_SEND_PUSH           = 'send-push';

// ── Interfaces dos payloads ───────────────────────────────────────────────────

export interface AssignComplaintJob {
  denunciaId: string;
}

export interface MonitorComplaintsJob {
  // sem payload — job global que varre todas as denúncias abertas
}

export interface SendPushJob {
  usuarioId?:  string;
  denunciaId?: string;
  titulo:      string;
  mensagem:    string;
  url?:        string;
}
