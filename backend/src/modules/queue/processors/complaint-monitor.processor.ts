import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import {
  QUEUE_COMPLAINT_MONITOR,
  QUEUE_PUSH_NOTIFICATION,
  JOB_MONITOR_COMPLAINTS,
  JOB_SEND_PUSH,
  MonitorComplaintsJob,
  SendPushJob,
} from '../queue.constants';

const OVERDUE_HOURS = 72;

@Processor(QUEUE_COMPLAINT_MONITOR)
export class ComplaintMonitorProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(ComplaintMonitorProcessor.name);

  constructor(
    private readonly prisma:        PrismaService,
    private readonly notifications: NotificationsService,
    @InjectQueue(QUEUE_COMPLAINT_MONITOR)  private readonly monitorQueue: Queue,
    @InjectQueue(QUEUE_PUSH_NOTIFICATION)  private readonly pushQueue:    Queue,
  ) {
    super();
  }

  async onModuleInit() {
    await this.monitorQueue.add(
      JOB_MONITOR_COMPLAINTS,
      {} satisfies MonitorComplaintsJob,
      {
        repeat:           { pattern: '*/30 * * * *' },
        removeOnComplete: true,
        removeOnFail:     false,
      },
    );
    this.logger.log('Monitor de denúncias agendado (*/30 * * * *)');
  }

  async process(job: Job<MonitorComplaintsJob>): Promise<void> {
    if (job.name !== JOB_MONITOR_COMPLAINTS) return;

    this.logger.log('Executando monitor de denúncias...');

    const threshold = new Date(Date.now() - OVERDUE_HOURS * 60 * 60 * 1000);

    const overdue = await this.prisma.denuncia.findMany({
      where:  { status: 'aberto', criadoEm: { lte: threshold } },
      select: { id: true, titulo: true, autorId: true },
    });

    this.logger.log(`${overdue.length} denúncia(s) atrasada(s) encontrada(s)`);

    for (const denuncia of overdue) {
      // WebSocket — alerta em tempo real (se o usuário estiver conectado)
      this.notifications.emitNotification(
        denuncia.autorId,
        '⏰ Denúncia aguardando resposta',
        `"${denuncia.titulo}" ainda está aberta há mais de ${OVERDUE_HOURS}h.`,
        denuncia.id,
      );

      // Push — notifica mesmo com app fechado
      const pushPayload: SendPushJob = {
        usuarioId: denuncia.autorId,
        titulo:    '⏰ Atualização pendente',
        mensagem:  `Sua denúncia "${denuncia.titulo}" ainda está aberta há mais de ${OVERDUE_HOURS}h.`,
        url:       `/denuncias/${denuncia.id}`,
      };

      await this.pushQueue.add(JOB_SEND_PUSH, pushPayload, {
        attempts:         2,
        removeOnComplete: true,
      });
    }
  }
}
