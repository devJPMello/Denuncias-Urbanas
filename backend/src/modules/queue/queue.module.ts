import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  QUEUE_COMPLAINT_ASSIGNMENT,
  QUEUE_COMPLAINT_MONITOR,
  QUEUE_PUSH_NOTIFICATION,
} from './queue.constants';
import { ComplaintAssignmentProcessor } from './processors/complaint-assignment.processor';
import { ComplaintMonitorProcessor }    from './processors/complaint-monitor.processor';
import { PushNotificationProcessor }    from './processors/push-notification.processor';

@Module({
  imports: [
    // Conexão Redis global para BullMQ
    BullModule.forRootAsync({
      imports:    [ConfigModule],
      inject:     [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host:     config.get<string>('REDIS_HOST', 'localhost'),
          port:     config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD'),
        },
      }),
    }),

    // Registra as três filas
    BullModule.registerQueue(
      { name: QUEUE_COMPLAINT_ASSIGNMENT },
      { name: QUEUE_COMPLAINT_MONITOR },
      { name: QUEUE_PUSH_NOTIFICATION },
    ),
  ],
  providers: [
    ComplaintAssignmentProcessor,
    ComplaintMonitorProcessor,
    PushNotificationProcessor,
  ],
  exports: [BullModule], // permite que outros módulos injetem as filas
})
export class QueueModule {}
