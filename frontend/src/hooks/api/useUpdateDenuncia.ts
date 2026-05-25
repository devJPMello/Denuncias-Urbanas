/**
 * useUpdateDenuncia — atualiza denúncia (admin) via TanStack Query mutation.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../services/api';
import { ApiDenuncia, Complaint, UpdateDenunciaPayload, mapApiDenuncia } from '../../types';
import { CLERK_ENABLED } from '../../lib/auth';

interface UseUpdateDenunciaResult {
  update:    (id: string, payload: UpdateDenunciaPayload) => Promise<Complaint>;
  isLoading: boolean;
  error:     string | null;
}

export function useUpdateDenuncia(): UseUpdateDenunciaResult {
  const { getToken } = useAuth();
  const queryClient  = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation<
    ApiDenuncia,
    Error,
    { id: string; payload: UpdateDenunciaPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      const token = CLERK_ENABLED ? await getToken() : null;
      return api.put<ApiDenuncia>(`/denuncias/${id}`, payload, token);
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['denuncias'] });
      queryClient.invalidateQueries({ queryKey: ['denuncias', id] });
    },
  });

  return {
    update:    (id, payload) => mutateAsync({ id, payload }).then(mapApiDenuncia),
    isLoading: isPending,
    error:     error ? String(error) : null,
  };
}
