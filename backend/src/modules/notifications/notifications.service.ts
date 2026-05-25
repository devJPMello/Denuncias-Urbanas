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

export interface ComplaintCreatedPayload {
  denunciaId: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  /** Sala do painel municipal (acesso aberto, sem login). */
  private static readonly MUNICIPAL_PANEL_ROOM = 'municipal-panel';

  constructor(private readonly gateway: NotificationsGateway) {}

  /**
   * Nova denúncia — painel municipal atualiza sem F5.
   */
  emitComplaintCreated(denunciaId: string): void {
    const payload: ComplaintCreatedPayload = { denunciaId };
    this.emitToMunicipalPanel('complaint:created', payload);
    this.logger.debug(`complaint:created → municipal-panel | #${denunciaId}`);
  }

  /**
   * Emite complaint:updated para o autor e para o painel municipal aberto.
   */
  emitComplaintUpdate(
    userId:     string,
    denunciaId: string,
    status:     string,
    updatedAt:  Date,
  ): void {
    const payload: ComplaintUpdatedPayload = { denunciaId, status, updatedAt };
    this.emitToUser(userId, 'complaint:updated', payload);
    this.emitToMunicipalPanel('complaint:updated', payload);
    this.logger.debug(`complaint:updated → user:${userId} + municipal-panel | status=${status}`);
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

  emitToMunicipalPanel(event: string, data: unknown): void {
    this.gateway.server
      ?.to(NotificationsService.MUNICIPAL_PANEL_ROOM)
      .emit(event, data);
  }
}
