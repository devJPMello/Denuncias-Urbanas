import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usuariosService: UsuariosService,
  ) {}

  async login(email: string, senha: string) {
    if (!email.toLowerCase().endsWith('@denunurban.com')) {
      throw new UnauthorizedException('Acesso restrito a contas @denunUrban.com');
    }

    const user = await this.usuariosService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const match = await bcrypt.compare(senha, user.senha);
    if (!match) throw new UnauthorizedException('Credenciais inválidas');

    const token = await this.jwtService.signAsync({
      sub:   user.id,
      email: user.email,
      role:  user.role,
    });

    return {
      token,
      primeiroLogin: user.primeiroLogin,
      user: { id: user.id, nome: user.nome, email: user.email, role: user.role },
    };
  }

  async changePassword(userId: string, novaSenha: string) {
    if (novaSenha.length < 6) {
      throw new BadRequestException('A senha deve ter no mínimo 6 caracteres');
    }
    const hashed = await bcrypt.hash(novaSenha, 10);
    const updated = await this.usuariosService.update(userId, {
      senha:         hashed,
      primeiroLogin: false,
    });

    const token = await this.jwtService.signAsync({
      sub:   updated.id,
      email: updated.email,
      role:  updated.role,
    });

    return { token };
  }

  me(user: { sub: string; email: string; role: string }) {
    return user;
  }
}
