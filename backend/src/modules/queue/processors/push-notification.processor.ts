import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import * as webpush from 'web-push';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  QUEUE_PUSH_NOTIFICATION,
  JOB_SEND_PUSH,
  SendPushJob,
} from '../queue.constants';

@Processor(QUEUE_PUSH_NOTIFICATION)
export class PushNotificationProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(PushNotificationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  onModuleInit() {
    webpush.setVapidDetails(
      `mailto:${this.config.getOrThrow<string>('VAPID_EMAIL')}`,
      this.config.getOrThrow<string>('VAPID_PUBLIC_KEY'),
      this.config.getOrThrow<string>('VAPID_PRIVATE_KEY'),
    );
  }

  async process(job: Job<SendPushJob>): Promise<void> {
    if (job.name !== JOB_SEND_PUSH) return;

    const { usuarioId, titulo, mensagem, url } = job.data;

    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { usuarioId },
    });

    if (subscriptions.length === 0) {
      this.logger.debug(`Nenhuma subscription para usuário ${usuarioId}`);
      return;
    }

    const payload = JSON.stringify({ titulo, mensagem, url: url ?? '/' });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        );
        this.logger.debug(`Push enviado → ${usuarioId}`);
      } catch (err: any) {
        // 410 Gone = subscription expirada → remove do banco
        if (err?.statusCode === 410) {
          await this.prisma.pushSubscription.delete({ where: { id: sub.id } });
          this.logger.warn(`Subscription expirada removida: ${sub.endpoint}`);
        } else {
          this.logger.error(`Erro ao enviar push: ${err?.message}`);
          throw err; // deixa BullMQ retentar
        }
      }
    }
  }
}
