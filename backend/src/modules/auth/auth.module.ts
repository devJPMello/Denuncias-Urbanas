import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports:     [UsuariosModule],
  controllers: [AuthController],
  providers:   [AuthService, ClerkAuthGuard],
  exports:     [ClerkAuthGuard],       // outros módulos importam AuthModule para usar o guard
})
export class AuthModule {}
