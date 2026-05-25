/**
 * useDenuncia — busca uma denúncia pelo id (detalhe) via TanStack Query.
 */
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { ApiDenuncia, Complaint, mapApiDenuncia } from '../../types';

interface UseDenunciaResult {
  complaint: Complaint | null;
  raw:       ApiDenuncia | null;
  isLoading: boolean;
  error:     string | null;
  refetch:   () => void;
}

export function useDenuncia(id: string | null): UseDenunciaResult {
  const { data, isLoading, error, refetch } = useQuery<ApiDenuncia>({
    queryKey: ['denuncias', id],
    queryFn:  () => api.get<ApiDenuncia>(`/denuncias/${id}`),
    enabled:  !!id,
    staleTime: 30_000,
    retry: 1,
  });

  return {
    complaint: data ? mapApiDenuncia(data) : null,
    raw:       data ?? null,
    isLoading,
    error:     error ? String(error) : null,
    refetch,
  };
}
