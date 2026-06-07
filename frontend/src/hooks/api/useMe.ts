/**
 * useMe — retorna o perfil do admin autenticado (inclui role).
 */
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth } from '../../lib/auth';
import { api } from '../../services/api';

interface Me {
  sub:   string;
  email: string;
  role:  'cidadao' | 'admin';
}

export function useMe() {
  const { token, isAuthenticated } = useAdminAuth();

  const { data, isLoading } = useQuery<Me>({
    queryKey:  ['me'],
    queryFn:   () => api.get<Me>('/auth/me', token),
    enabled:   isAuthenticated,
    staleTime: 5 * 60_000,
    retry:     1,
  });

  return {
    me:      data ?? null,
    isAdmin: data?.role === 'admin',
    isLoading,
  };
}
