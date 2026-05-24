import { Injectable } from '@nestjs/common';
import { Usuario } from '@prisma/client';

@Injectable()
export class AuthService {
  me(user: Usuario) {
    const { ...safe } = user;
    return safe;
  }
}
