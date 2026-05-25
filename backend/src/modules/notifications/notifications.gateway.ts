import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '@clerk/backend';
import { UsuariosService } from '../usuarios/usuarios.service';

@WebSocketGateway({
  cors: {
    origin:      process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  readonly server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly config: ConfigService,
    private readonly usuariosService: UsuariosService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    const mode  = client.handshake.auth?.mode as string | undefined;

    // Painel municipal aberto (sem Clerk) — só recebe atualizações da lista
    if (mode === 'municipal-panel') {
      await client.join('municipal-panel');
      client.data.mode = 'municipal-panel';
      this.logger.debug(`Painel municipal conectado (socket ${client.id})`);
      return;
    }

    if (!token) {
      this.logger.warn(`Conexão recusada — token ausente (${client.id})`);
      client.disconnect();
      return;
    }

    try {
      const payload = await verifyToken(token, {
        secretKey: this.config.getOrThrow<string>('CLERK_SECRET_KEY'),
      });

      const user = await this.usuariosService.findOrCreate({
        clerkId: payload.sub,
        nome:    (payload as { name?: string }).name  ?? 'Usuário',
        email:   (payload as { email?: string }).email ?? `${payload.sub}@clerk.local`,
      });

      await client.join(`user:${user.id}`);
      client.data.userId = user.id;

      this.logger.debug(`Conectado: ${user.id} (socket ${client.id})`);
    } catch {
      this.logger.warn(`Token inválido — conexão recusada (${client.id})`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data?.userId ?? 'anônimo';
    this.logger.debug(`Desconectado: ${userId} (socket ${client.id})`);
  }
}
