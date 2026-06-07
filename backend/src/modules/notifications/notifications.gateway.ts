import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
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

  async handleConnection(client: Socket) {
    const mode = client.handshake.auth?.mode as string | undefined;

    if (mode === 'municipal-panel') {
      await client.join('municipal-panel');
      client.data.mode = 'municipal-panel';
      this.logger.debug(`Painel municipal conectado (socket ${client.id})`);
      return;
    }

    // Cidadão anônimo — conecta sem autenticação
    await client.join('public');
    client.data.mode = 'citizen';
    this.logger.debug(`Cidadão conectado anonimamente (socket ${client.id})`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Desconectado: ${client.id}`);
  }
}
