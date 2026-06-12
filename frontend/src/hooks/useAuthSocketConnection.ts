/**
 * Mantém o socket conectado: com token quando logado, anonimamente caso contrário.
 * Reconecta automaticamente ao fazer login ou logout.
 */
import { useEffect } from 'react';
import { useAdminAuth } from '../lib/auth';
import { authSocketService } from '../services/socketService';

export function useAuthSocketConnection(): void {
  const { token } = useAdminAuth();

  useEffect(() => {
    authSocketService.disconnect();
    if (token) {
      authSocketService.connectAuth(token);
    } else {
      authSocketService.connectAnonymous();
    }
  }, [token]);
}
