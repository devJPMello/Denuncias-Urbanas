/**
 * useCreateDenuncia — envia o formulário de nova denúncia para o backend.
 */
import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../services/api';
import { ApiDenuncia, Complaint, CreateDenunciaPayload, mapApiDenuncia } from '../../types';

interface UseCreateDenunciaResult {
  create:    (payload: CreateDenunciaPayload) => Promise<Complaint>;
  isLoading: boolean;
  error:     string | null;
}

export function useCreateDenuncia(): UseCreateDenunciaResult {
  const { getToken } = useAuth();
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const create = useCallback(async (payload: CreateDenunciaPayload): Promise<Complaint> => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const data  = await api.post<ApiDenuncia>('/denuncias', payload, token);
      return mapApiDenuncia(data);
    } catch (err) {
      const msg = String(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { create, isLoading, error };
}
