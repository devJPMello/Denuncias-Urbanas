import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MulterModule.register({}),
    AuthModule,
  ],
  controllers: [UploadController],
})
export class UploadModule {}
