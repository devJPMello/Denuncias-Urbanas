import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule }    from './prisma/prisma.module';
import { QueueModule }     from './modules/queue/queue.module';
import { DenunciasModule } from './modules/denuncias/denuncias.module';
import { UsuariosModule }  from './modules/usuarios/usuarios.module';
import { AuthModule }      from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    QueueModule,
    DenunciasModule,
    UsuariosModule,
    AuthModule,
  ],
})
export class AppModule {}
