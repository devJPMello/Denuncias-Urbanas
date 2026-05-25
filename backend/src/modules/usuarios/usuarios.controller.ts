import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { ClerkAuthGuard }  from '../auth/guards/clerk-auth.guard';
import { CurrentUser }     from '../auth/decorators/current-user.decorator';
import type { Usuario }    from '@prisma/client';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /** Retorna o perfil completo do usuário autenticado (inclui o role). */
  @UseGuards(ClerkAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: Usuario) {
    return user;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.create(dto);
  }
}
