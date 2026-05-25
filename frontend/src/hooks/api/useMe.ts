/**
 * useMe — retorna o perfil do usuário autenticado (inclui role).
 * Usado para controle de acesso ao painel admin no frontend.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../services/api';
import { CLERK_ENABLED } from '../../lib/auth';

interface Me {
  id:    string;
  nome:  string;
  email: string;
  role:  'cidadao' | 'admin';
}

export function useMe() {
  const { getToken, isSignedIn } = useAuth();

  const { data, isLoading } = useQuery<Me>({
    queryKey: ['me'],
    queryFn:  async () => {
      const token = CLERK_ENABLED ? await getToken() : null;
      return api.get<Me>('/usuarios/me', token);
    },
    enabled:   !!isSignedIn,
    staleTime: 5 * 60_000, // 5 min — role não muda com frequência
    retry:     1,
  });

  return {
    me:      data ?? null,
    isAdmin: data?.role === 'admin',
    isLoading,
  };
}
