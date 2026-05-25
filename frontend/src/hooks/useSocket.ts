/**
 * useSocket — subscribe em eventos do socket do cidadão.
 * Conexão: useAuthSocketConnection (App / NotificationProvider).
 */

import { useCallback } from 'react';
import { authSocketService } from '../services/socketService';

export interface UseSocketReturn {
  subscribe:   <T = unknown>(event: string, handler: (data: T) => void) => void;
  unsubscribe: <T = unknown>(event: string, handler: (data: T) => void) => void;
  connected:   boolean;
}

export function useSocket(): UseSocketReturn {
  const subscribe = useCallback(
    <T = unknown>(event: string, handler: (data: T) => void) => {
      authSocketService.on<T>(event, handler);
    },
    [],
  );

  const unsubscribe = useCallback(
    <T = unknown>(event: string, handler: (data: T) => void) => {
      authSocketService.off<T>(event, handler);
    },
    [],
  );

  return { subscribe, unsubscribe, connected: authSocketService.connected };
}
