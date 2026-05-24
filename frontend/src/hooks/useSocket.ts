/**
 * useSocket
 *
 * Garante que o singleton socketService esteja conectado enquanto o usuário
 * estiver autenticado. Expõe subscribe/unsubscribe para eventos Socket.io.
 */

import { useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { socketService } from '../services/socketService';

export interface UseSocketReturn {
  subscribe:   <T = unknown>(event: string, handler: (data: T) => void) => void;
  unsubscribe: <T = unknown>(event: string, handler: (data: T) => void) => void;
  connected:   boolean;
}

export function useSocket(): UseSocketReturn {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) return;

    getToken().then((token) => {
      if (token) socketService.connect(token);
    });

    // O singleton não é desconectado no unmount —
    // a conexão deve durar toda a sessão do usuário.
  }, [isSignedIn, getToken]);

  const subscribe = useCallback(
    <T = unknown>(event: string, handler: (data: T) => void) => {
      socketService.on<T>(event, handler);
    },
    [],
  );

  const unsubscribe = useCallback(
    <T = unknown>(event: string, handler: (data: T) => void) => {
      socketService.off<T>(event, handler);
    },
    [],
  );

  return { subscribe, unsubscribe, connected: socketService.connected };
}
