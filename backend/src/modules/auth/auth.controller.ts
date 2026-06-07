import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto, ChangePasswordDto } from './dto/login.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.senha);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(
    @Req() req: Request,
    @Body() body: ChangePasswordDto,
  ) {
    const user = req['user'] as { sub: string };
    return this.authService.changePassword(user.sub, body.novaSenha);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    return this.authService.me(req['user'] as { sub: string; email: string; role: string });
  }
}
