/**
 * useUpdateDenuncia — atualiza o status/dados de uma denúncia (uso admin).
 */
import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../services/api';
import { ApiDenuncia, Complaint, UpdateDenunciaPayload, mapApiDenuncia } from '../../types';

interface UseUpdateDenunciaResult {
  update:    (id: string, payload: UpdateDenunciaPayload) => Promise<Complaint>;
  isLoading: boolean;
  error:     string | null;
}

export function useUpdateDenuncia(): UseUpdateDenunciaResult {
  const { getToken } = useAuth();
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const update = useCallback(async (id: string, payload: UpdateDenunciaPayload): Promise<Complaint> => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const data  = await api.put<ApiDenuncia>(`/denuncias/${id}`, payload, token);
      return mapApiDenuncia(data);
    } catch (err) {
      const msg = String(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { update, isLoading, error };
}
