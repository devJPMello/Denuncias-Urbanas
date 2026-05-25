import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MulterModule } from '@nestjs/platform-express';
import { DenunciasController } from './denuncias.controller';
import { DenunciasService } from './denuncias.service';
import { QUEUE_COMPLAINT_ASSIGNMENT } from '../queue/queue.constants';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MulterModule.register({}),
    BullModule.registerQueue({ name: QUEUE_COMPLAINT_ASSIGNMENT }),
    AuthModule,
  ],
  controllers: [DenunciasController],
  providers:   [DenunciasService],
})
export class DenunciasModule {}
