import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule }        from './prisma/prisma.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { QueueModule }         from './modules/queue/queue.module';
import { DenunciasModule }     from './modules/denuncias/denuncias.module';
import { UsuariosModule }      from './modules/usuarios/usuarios.module';
import { AuthModule }          from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    NotificationsModule, // antes do QueueModule — processors dependem de NotificationsService
    QueueModule,
    DenunciasModule,
    UsuariosModule,
    AuthModule,
  ],
})
export class AppModule {}
