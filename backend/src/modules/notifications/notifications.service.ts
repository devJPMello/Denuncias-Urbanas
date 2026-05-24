import { Injectable, Logger } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

// ── Payloads dos eventos ──────────────────────────────────────────────────────

export interface ComplaintUpdatedPayload {
  denunciaId: string;
  status:     string;
  updatedAt:  Date;
}

export interface NotificationNewPayload {
  title:      string;
  body:       string;
  denunciaId: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly gateway: NotificationsGateway) {}

  /**
   * Emite complaint:updated para o autor da denúncia.
   * Usado quando o status de uma denúncia muda.
   */
  emitComplaintUpdate(
    userId:     string,
    denunciaId: string,
    status:     string,
    updatedAt:  Date,
  ): void {
    const payload: ComplaintUpdatedPayload = { denunciaId, status, updatedAt };
    this.emitToUser(userId, 'complaint:updated', payload);
    this.logger.debug(`complaint:updated → user:${userId} | status=${status}`);
  }

  /**
   * Emite notification:new para um usuário específico.
   * Usado para alertas como denúncias atrasadas.
   */
  emitNotification(
    userId:     string,
    title:      string,
    body:       string,
    denunciaId: string,
  ): void {
    const payload: NotificationNewPayload = { title, body, denunciaId };
    this.emitToUser(userId, 'notification:new', payload);
    this.logger.debug(`notification:new → user:${userId} | "${title}"`);
  }

  /**
   * Emite um evento genérico para a sala de um usuário.
   */
  emitToUser(userId: string, event: string, data: unknown): void {
    this.gateway.server?.to(`user:${userId}`).emit(event, data);
  }
}
