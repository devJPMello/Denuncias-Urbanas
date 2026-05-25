import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MulterModule } from '@nestjs/platform-express';
import { DenunciasController } from './denuncias.controller';
import { DenunciasService } from './denuncias.service';
import { QUEUE_PUSH_NOTIFICATION } from '../queue/queue.constants';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { GeocodeModule } from '../geocode/geocode.module';

@Module({
  imports: [
    MulterModule.register({}),
    BullModule.registerQueue({ name: QUEUE_PUSH_NOTIFICATION }),
    AuthModule,
    NotificationsModule,
    GeocodeModule,
  ],
  controllers: [DenunciasController],
  providers:   [DenunciasService],
})
export class DenunciasModule {}
