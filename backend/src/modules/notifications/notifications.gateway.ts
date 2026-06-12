import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

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

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    const mode  = client.handshake.auth?.mode  as string | undefined;
    const token = client.handshake.auth?.token as string | undefined;

    if (mode === 'municipal-panel') {
      await client.join('municipal-panel');
      client.data.mode = 'municipal-panel';
      this.logger.debug(`Painel municipal conectado (socket ${client.id})`);
      return;
    }

    if (token) {
      try {
        const payload = this.jwtService.verify<{ sub: string }>(token);
        await client.join(`user:${payload.sub}`);
        client.data.mode   = 'citizen-auth';
        client.data.userId = payload.sub;
        this.logger.debug(`Usuário ${payload.sub} conectado (socket ${client.id})`);
        return;
      } catch {
        // token inválido — cai no anônimo abaixo
      }
    }

    await client.join('public');
    client.data.mode = 'citizen';
    this.logger.debug(`Cidadão conectado anonimamente (socket ${client.id})`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Desconectado: ${client.id}`);
  }
}
