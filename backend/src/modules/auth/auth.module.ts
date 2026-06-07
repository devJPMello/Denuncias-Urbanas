import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    UsuariosModule,
    JwtModule.registerAsync({
      imports:    [ConfigModule],
      inject:     [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:       config.getOrThrow<string>('JWT_SECRET'),
        signOptions:  { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers:   [AuthService, JwtAuthGuard],
  exports:     [AuthService, JwtAuthGuard, JwtModule, UsuariosModule],
})
export class AuthModule {}
