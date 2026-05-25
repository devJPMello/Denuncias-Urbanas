/**
 * useDenuncias — lista pública de denúncias com cache via TanStack Query.
 * Suporta limit e page para paginação.
 */
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { ApiDenuncia, Complaint, mapApiDenuncia } from '../../types';

interface UseDenunciasResult {
  complaints: Complaint[];
  raw:        ApiDenuncia[];
  isLoading:  boolean;
  error:      string | null;
  refetch:    () => void;
}

export function useDenuncias(limit = 100, page = 1): UseDenunciasResult {
  const { data = [], isLoading, error, refetch } = useQuery<ApiDenuncia[]>({
    queryKey:  ['denuncias', limit, page],
    queryFn:   () => api.get<ApiDenuncia[]>(`/denuncias?limit=${limit}&page=${page}`),
    staleTime: 30_000,   // 30s antes de buscar novamente em background
    retry:     2,
  });

  return {
    complaints: data.map(mapApiDenuncia),
    raw:        data,
    isLoading,
    error:      error ? String(error) : null,
    refetch,
  };
}
