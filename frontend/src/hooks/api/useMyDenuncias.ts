/**
 * useMyDenuncias — todas as denúncias registradas (acesso público).
 */
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { ApiDenuncia, Complaint, mapApiDenuncia } from '../../types';

interface UseMyDenunciasResult {
  complaints: Complaint[];
  raw:        ApiDenuncia[];
  isLoading:  boolean;
  error:      string | null;
}

export function useMyDenuncias(): UseMyDenunciasResult {
  const { data = [], isLoading, error } = useQuery<ApiDenuncia[]>({
    queryKey: ['my-denuncias'],
    queryFn:  () => api.get<ApiDenuncia[]>('/denuncias'),
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
