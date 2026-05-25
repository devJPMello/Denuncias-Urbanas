import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { UnsubscribeDto } from './dto/unsubscribe.dto';

export interface PushPayload {
  titulo:  string;
  mensagem: string;
  url?:    string;
}

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    webpush.setVapidDetails(
      `mailto:${this.config.getOrThrow<string>('VAPID_EMAIL')}`,
      this.config.getOrThrow<string>('VAPID_PUBLIC_KEY'),
      this.config.getOrThrow<string>('VAPID_PRIVATE_KEY'),
    );
    this.logger.log('VAPID configurado');
  }

  // ── Endpoints ─────────────────────────────────────────────────────────────

  /** Salva (ou atualiza) a subscription do dispositivo no banco. */
  async saveSubscription(usuarioId: string, dto: SubscribeDto) {
    return this.prisma.pushSubscription.upsert({
      where:  { endpoint: dto.endpoint },
      update: { p256dh: dto.keys.p256dh, auth: dto.keys.auth, usuarioId },
      create: { endpoint: dto.endpoint, p256dh: dto.keys.p256dh, auth: dto.keys.auth, usuarioId },
    });
  }

  /** Remove a subscription do banco (logout / revogação). */
  async removeSubscription(dto: UnsubscribeDto) {
    try {
      await this.prisma.pushSubscription.delete({ where: { endpoint: dto.endpoint } });
    } catch {
      // ignora se não existir
    }
  }

  /** Retorna a chave pública VAPID para o frontend. */
  getVapidPublicKey(): string {
    return this.config.getOrThrow<string>('VAPID_PUBLIC_KEY');
  }

  // ── Envio ─────────────────────────────────────────────────────────────────

  /**
   * Envia uma push notification para todos os dispositivos de um usuário.
   * Remove automaticamente subscriptions expiradas (HTTP 410).
   */
  async sendToUser(usuarioId: string, payload: PushPayload): Promise<void> {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { usuarioId },
    });

    if (subscriptions.length === 0) {
      this.logger.debug(`Nenhuma subscription para ${usuarioId}`);
      return;
    }

    const body = JSON.stringify({
      title: payload.titulo,
      body:  payload.mensagem,
      url:   payload.url,
    });

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            body,
          );
          this.logger.debug(`Push enviado → ${usuarioId}`);
        } catch (err: any) {
          if (err?.statusCode === 410) {
            await this.prisma.pushSubscription.delete({ where: { id: sub.id } });
            this.logger.warn(`Subscription expirada removida: ${sub.endpoint}`);
          } else {
            this.logger.error(`Erro ao enviar push para ${sub.endpoint}: ${err?.message}`);
            throw err;
          }
        }
      }),
    );
  }
}
