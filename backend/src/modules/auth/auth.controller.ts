import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Usuario } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Retorna os dados do usuário autenticado (útil para debug / profile). */
  @Get('me')
  @UseGuards(ClerkAuthGuard)
  me(@CurrentUser() user: Usuario) {
    return this.authService.me(user);
  }
}
