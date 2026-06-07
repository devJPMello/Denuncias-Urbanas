/**
 * useCreateDenuncia — envia nova denúncia anonimamente (multipart se houver foto).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { ApiDenuncia, Complaint, CreateDenunciaPayload, mapApiDenuncia } from '../../types';

interface UseCreateDenunciaResult {
  create:    (payload: CreateDenunciaPayload) => Promise<Complaint>;
  isLoading: boolean;
  error:     string | null;
}

function buildFormData(payload: CreateDenunciaPayload): FormData {
  const { imagemFile, ...fields } = payload;
  const fd = new FormData();
  if (imagemFile) fd.append('imagem', imagemFile);
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) fd.append(key, String(value));
  }
  return fd;
}

export function useCreateDenuncia(): UseCreateDenunciaResult {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation<ApiDenuncia, Error, CreateDenunciaPayload>({
    mutationFn: async (payload) => {
      const formData = buildFormData(payload);
      return api.upload<ApiDenuncia>('/denuncias', formData);
    },
    onSuccess: () => {
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
