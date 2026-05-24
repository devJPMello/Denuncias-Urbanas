import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DenunciasController } from './denuncias.controller';
import { DenunciasService } from './denuncias.service';
import { QUEUE_COMPLAINT_ASSIGNMENT } from '../queue/queue.constants';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUE_COMPLAINT_ASSIGNMENT }),
  ],
  controllers: [DenunciasController],
  providers:   [DenunciasService],
})
export class DenunciasModule {}
