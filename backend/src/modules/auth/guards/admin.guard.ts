import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { Usuario } from '@prisma/client';

/**
 * Garante que o usuário autenticado (preenchido pelo ClerkAuthGuard)
 * possui role === 'admin'. Sempre use após ClerkAuthGuard.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user as Usuario | undefined;
    if (user?.role !== 'admin') {
      throw new ForbiddenException('Acesso restrito a administradores');
    }
    return true;
  }
}
