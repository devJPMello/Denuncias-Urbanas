/**
 * Mantém o socket do cidadão conectado anonimamente em qualquer tela.
 */
import { useEffect } from 'react';
import { authSocketService } from '../services/socketService';

export function useAuthSocketConnection(): void {
  useEffect(() => {
    authSocketService.connectAnonymous();
  }, []);
}
