import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  QUEUE_COMPLAINT_MONITOR,
  QUEUE_PUSH_NOTIFICATION,
  JOB_MONITOR_COMPLAINTS,
  JOB_SEND_PUSH,
  MonitorComplaintsJob,
  SendPushJob,
} from '../queue.constants';

// Denúncias abertas há mais de 3 dias sem atualização são consideradas atrasadas
const OVERDUE_HOURS = 72;

@Processor(QUEUE_COMPLAINT_MONITOR)
export class ComplaintMonitorProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(ComplaintMonitorProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_COMPLAINT_MONITOR) private readonly monitorQueue: Queue,
    @InjectQueue(QUEUE_PUSH_NOTIFICATION) private readonly pushQueue: Queue,
  ) {
    super();
  }

  /** Agenda o job recorrente ao subir a aplicação. */
  async onModuleInit() {
    await this.monitorQueue.add(
      JOB_MONITOR_COMPLAINTS,
      {} satisfies MonitorComplaintsJob,
      {
        repeat:           { pattern: '*/30 * * * *' }, // a cada 30 minutos
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
      where: {
        status:   'aberto',
        criadoEm: { lte: threshold },
      },
      select: { id: true, titulo: true, autorId: true },
    });

    this.logger.log(`${overdue.length} denúncia(s) atrasada(s) encontrada(s)`);

    for (const denuncia of overdue) {
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
