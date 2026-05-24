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

  constructor(private readonly config: ConfigService) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;

    if (!token) {
      this.logger.warn(`Conexão recusada — token ausente (${client.id})`);
      client.disconnect();
      return;
    }

    try {
      const payload = await verifyToken(token, {
        secretKey: this.config.getOrThrow<string>('CLERK_SECRET_KEY'),
      });

      const userId = payload.sub;
      await client.join(`user:${userId}`);
      client.data.userId = userId;

      this.logger.debug(`Conectado: ${userId} (socket ${client.id})`);
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
