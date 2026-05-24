import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import {
  QUEUE_COMPLAINT_ASSIGNMENT,
  QUEUE_PUSH_NOTIFICATION,
  JOB_ASSIGN_COMPLAINT,
  JOB_SEND_PUSH,
  AssignComplaintJob,
  SendPushJob,
} from '../queue.constants';

@Processor(QUEUE_COMPLAINT_ASSIGNMENT)
export class ComplaintAssignmentProcessor extends WorkerHost {
  private readonly logger = new Logger(ComplaintAssignmentProcessor.name);

  constructor(
    private readonly prisma:         PrismaService,
    private readonly notifications:  NotificationsService,
    @InjectQueue(QUEUE_PUSH_NOTIFICATION) private readonly pushQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<AssignComplaintJob>): Promise<void> {
    if (job.name !== JOB_ASSIGN_COMPLAINT) return;

    const { denunciaId } = job.data;
    this.logger.log(`Processando atribuição da denúncia #${denunciaId}`);

    const denuncia = await this.prisma.denuncia.findUnique({
      where:   { id: denunciaId },
      include: { autor: true },
    });

    if (!denuncia) {
      this.logger.warn(`Denúncia #${denunciaId} não encontrada — job ignorado`);
      return;
    }

    const updated = await this.prisma.denuncia.update({
      where: { id: denunciaId },
      data:  { status: 'analise' },
    });

    this.logger.log(`Denúncia #${denunciaId} movida para analise`);

    // WebSocket — atualiza a UI em tempo real
    this.notifications.emitComplaintUpdate(
      denuncia.autorId,
      denunciaId,
      updated.status,
      updated.atualizadoEm,
    );

    // Push notification — notifica mesmo com app fechado
    const pushPayload: SendPushJob = {
      usuarioId: denuncia.autorId,
      titulo:    '📋 Denúncia em análise',
      mensagem:  `Sua denúncia "${denuncia.titulo}" foi recebida e está sendo analisada.`,
      url:       `/denuncias/${denunciaId}`,
    };

    await this.pushQueue.add(JOB_SEND_PUSH, pushPayload, {
      attempts:         3,
      backoff:          { type: 'exponential', delay: 5_000 },
      removeOnComplete: true,
    });
  }
}
