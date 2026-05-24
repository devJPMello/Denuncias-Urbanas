import {
  Injectable, CanActivate, ExecutionContext, UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';
import { Request } from 'express';
import { UsuariosService } from '../../usuarios/usuarios.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly usuariosService: UsuariosService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(req);

    if (!token) throw new UnauthorizedException('Token não fornecido');

    let payload: Awaited<ReturnType<typeof verifyToken>>;
    try {
      payload = await verifyToken(token, {
        secretKey: this.config.getOrThrow<string>('CLERK_SECRET_KEY'),
      });
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    // Sincroniza o usuário no banco na primeira autenticação
    const user = await this.usuariosService.findOrCreate({
      clerkId: payload.sub,
      nome:    (payload as any).name  ?? 'Usuário',
      email:   (payload as any).email ?? `${payload.sub}@clerk.local`,
    });

    req['user'] = user;
    return true;
  }

  private extractToken(req: Request): string | null {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return null;
    return auth.slice(7);
  }
}
