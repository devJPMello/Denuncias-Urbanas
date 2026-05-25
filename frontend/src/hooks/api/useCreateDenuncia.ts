/**
 * useCreateDenuncia — envia nova denúncia via TanStack Query mutation.
 * Invalida automaticamente os caches de denúncias após criação.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../services/api';
import { ApiDenuncia, Complaint, CreateDenunciaPayload, mapApiDenuncia } from '../../types';
import { CLERK_ENABLED } from '../../lib/auth';

interface UseCreateDenunciaResult {
  create:    (payload: CreateDenunciaPayload) => Promise<Complaint>;
  isLoading: boolean;
  error:     string | null;
}

export function useCreateDenuncia(): UseCreateDenunciaResult {
  const { getToken } = useAuth();
  const queryClient  = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation<ApiDenuncia, Error, CreateDenunciaPayload>({
    mutationFn: async (payload) => {
      const token = CLERK_ENABLED ? await getToken() : null;
      return api.post<ApiDenuncia>('/denuncias', payload, token);
    },
    onSuccess: () => {
      // Invalida listas → próximo acesso vai buscar do servidor
      queryClient.invalidateQueries({ queryKey: ['denuncias'] });
      queryClient.invalidateQueries({ queryKey: ['my-denuncias'] });
    },
  });

  return {
    create:    async (payload) => mapApiDenuncia(await mutateAsync(payload)),
    isLoading: isPending,
    error:     error ? String(error) : null,
  };
}
