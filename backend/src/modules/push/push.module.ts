import { Global, Module } from '@nestjs/common';
import { PushController } from './push.controller';
import { PushService } from './push.service';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports:     [AuthModule],
  controllers: [PushController],
  providers:   [PushService],
  exports:     [PushService],
})
export class PushModule {}
