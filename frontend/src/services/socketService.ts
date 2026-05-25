/**
 * Singleton Socket.io client.
 *
 * Mantém uma única conexão para toda a aplicação.
 * O token Clerk é passado em handshake.auth para que o backend possa
 * verificar a identidade e adicionar o socket à sala correta.
 */

import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './api';

/** Socket.io fica na raiz do servidor, não em /api. */
function resolveSocketUrl(): string {
  if (API_BASE_URL.startsWith('http')) {
    return API_BASE_URL.replace(/\/api$/, '');
  }
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
}

const SOCKET_URL = resolveSocketUrl();

class SocketService {
  private socket: Socket | null = null;

  /** Conecta ao servidor. Ignora se já estiver conectado com o mesmo token. */
  connect(token: string): void {
    if (this.socket?.connected) return;

    // Desconecta socket obsoleto antes de reconectar (ex: refresh de token)
    this.socket?.disconnect();

    this.socket = io(SOCKET_URL, {
      auth:                { token },
      transports:          ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay:    2_000,
    });

    this.socket.on('connect', () =>
      console.info('[socket] conectado:', this.socket?.id),
    );
    this.socket.on('disconnect', (reason) =>
      console.info('[socket] desconectado:', reason),
    );
    this.socket.on('connect_error', (err) =>
      console.warn('[socket] erro de conexão:', err.message),
    );
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  on<T = unknown>(event: string, handler: (data: T) => void): void {
    this.socket?.on(event, handler as (...args: unknown[]) => void);
  }

  off<T = unknown>(event: string, handler: (data: T) => void): void {
    this.socket?.off(event, handler as (...args: unknown[]) => void);
  }

  get connected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
