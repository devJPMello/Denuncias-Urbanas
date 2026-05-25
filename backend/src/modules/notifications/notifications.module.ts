import { Global, Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Global()
@Module({
  imports:   [UsuariosModule],
  providers: [NotificationsGateway, NotificationsService],
  exports:   [NotificationsService],
})
export class NotificationsModule {}
