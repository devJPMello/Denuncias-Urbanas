/**
 * useMyDenuncias — denúncias do usuário autenticado via TanStack Query.
 */
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../services/api';
import { ApiDenuncia, Complaint, mapApiDenuncia } from '../../types';
import { CLERK_ENABLED } from '../../lib/auth';

interface UseMyDenunciasResult {
  complaints: Complaint[];
  raw:        ApiDenuncia[];
  isLoading:  boolean;
  error:      string | null;
}

export function useMyDenuncias(): UseMyDenunciasResult {
  const { getToken, isSignedIn } = useAuth();

  const { data = [], isLoading, error } = useQuery<ApiDenuncia[]>({
    queryKey: ['my-denuncias'],
    queryFn:  async () => {
      const token = CLERK_ENABLED ? await getToken() : null;
      return api.get<ApiDenuncia[]>('/denuncias/mine', token);
    },
    enabled:   !!isSignedIn,
    staleTime: 30_000,
    retry:     1,
  });

  return {
    complaints: data.map(mapApiDenuncia),
    raw:        data,
    isLoading,
    error: error ? String(error) : null,
  };
}
