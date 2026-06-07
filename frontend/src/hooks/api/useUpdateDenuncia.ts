/**
 * useUpdateDenuncia — atualiza denúncia (admin) via JWT.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth } from '../../lib/auth';
import { api } from '../../services/api';
import { ApiDenuncia, Complaint, UpdateDenunciaPayload, mapApiDenuncia } from '../../types';

interface UseUpdateDenunciaResult {
  update:    (id: string, payload: UpdateDenunciaPayload) => Promise<Complaint>;
  isLoading: boolean;
  error:     string | null;
}

export function useUpdateDenuncia(): UseUpdateDenunciaResult {
  const { token }   = useAdminAuth();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation<
    ApiDenuncia,
    Error,
    { id: string; payload: UpdateDenunciaPayload }
  >({
    mutationFn: async ({ id, payload }) =>
      api.put<ApiDenuncia>(`/denuncias/${id}`, payload, token),
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
