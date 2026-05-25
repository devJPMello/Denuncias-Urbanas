import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';

@Module({
  controllers: [UsuariosController],
  providers:   [UsuariosService, ClerkAuthGuard],
  exports:     [UsuariosService, ClerkAuthGuard],
})
export class UsuariosModule {}
