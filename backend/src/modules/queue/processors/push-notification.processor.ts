import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PushService } from '../../push/push.service';
import {
  QUEUE_PUSH_NOTIFICATION,
  JOB_SEND_PUSH,
  SendPushJob,
} from '../queue.constants';

@Processor(QUEUE_PUSH_NOTIFICATION)
export class PushNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(PushNotificationProcessor.name);

  constructor(private readonly pushService: PushService) {
    super();
  }

  async process(job: Job<SendPushJob>): Promise<void> {
    if (job.name !== JOB_SEND_PUSH) return;

    const { usuarioId, titulo, mensagem, url } = job.data;
    this.logger.debug(`Enviando push para ${usuarioId}: ${titulo}`);

    await this.pushService.sendToUser(usuarioId, { titulo, mensagem, url });
  }
}
