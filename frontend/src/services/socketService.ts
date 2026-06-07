/**
 * Dois sockets independentes:
 * - authSocket: cidadão logado (sino, notification:new)
 * - municipalSocket: painel municipal aberto (lista em tempo real)
 * Assim o painel não derruba a conexão do cidadão.
 */

import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './api';

function resolveSocketUrl(): string {
  if (API_BASE_URL.startsWith('http')) {
    return API_BASE_URL.replace(/\/api$/, '');
  }
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
}

const SOCKET_URL = resolveSocketUrl();

type Handler = (...args: unknown[]) => void;

class ManagedSocket {
  private socket: Socket | null = null;
  private readonly listeners = new Map<string, Set<Handler>>();
  private readonly label: string;

  constructor(label: string) {
    this.label = label;
  }

  private bindStoredListeners(): void {
    if (!this.socket) return;
    for (const [event, handlers] of this.listeners) {
      for (const handler of handlers) {
        this.socket.on(event, handler);
      }
    }
  }

  private createSocket(auth: Record<string, string>): void {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();

    this.socket = io(SOCKET_URL, {
      auth,
      transports:           ['websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay:    1_000,
    });

    this.socket.on('connect', () =>
      console.info(`[${this.label}] conectado:`, this.socket?.id),
    );
    this.socket.on('disconnect', (reason) =>
      console.info(`[${this.label}] desconectado:`, reason),
    );
    this.socket.on('connect_error', (err) =>
      console.warn(`[${this.label}] erro:`, err.message),
    );

    this.bindStoredListeners();
  }

  connectAuth(token: string): void {
    if (this.socket?.connected) return;
    this.createSocket({ token });
  }

  connectAnonymous(): void {
    if (this.socket?.connected) return;
    this.createSocket({});
  }

  connectMunicipalPanel(): void {
    if (this.socket?.connected) return;
    this.createSocket({ mode: 'municipal-panel' });
  }

  disconnect(): void {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
  }

  on<T = unknown>(event: string, handler: (data: T) => void): void {
    const wrapped = handler as Handler;
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(wrapped);
    this.socket?.on(event, wrapped);
  }

  off<T = unknown>(event: string, handler: (data: T) => void): void {
    const wrapped = handler as Handler;
    this.listeners.get(event)?.delete(wrapped);
    this.socket?.off(event, wrapped);
  }

  get connected(): boolean {
    return this.socket?.connected ?? false;
  }
}

/** Cidadão logado — notificações no sino. */
export const authSocketService = new ManagedSocket('socket');

/** Painel municipal — atualização da lista (sem login). */
export const municipalSocketService = new ManagedSocket('socket:municipal');

/** @deprecated use authSocketService — mantido para imports antigos */
export const socketService = authSocketService;
