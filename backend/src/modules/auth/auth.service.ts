import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async login(email: string, senha: string) {
    // TODO: validar credenciais e retornar JWT
    return { access_token: '' };
  }
}
