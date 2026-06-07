import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  controllers: [UsuariosController],
  providers:   [UsuariosService, JwtAuthGuard],
  exports:     [UsuariosService],
})
export class UsuariosModule {}
