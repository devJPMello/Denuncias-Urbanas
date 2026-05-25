/**
 * Mantém o socket do cidadão conectado em qualquer tela (não só no mapa).
 */
import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { authSocketService } from '../services/socketService';

export function useAuthSocketConnection(): void {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) return;

    let cancelled = false;

    const connect = async () => {
      const token = await getToken();
      if (!cancelled && token) authSocketService.connectAuth(token);
    };

    void connect();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, getToken]);
}
