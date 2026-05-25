/**
 * useDenuncia — busca uma denúncia pelo id (detalhe).
 */
import { useState, useEffect, useCallback } from 'react';
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
  const [raw, setRaw]           = useState<ApiDenuncia | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [tick, setTick]         = useState(0);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!id) {
      setRaw(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    api.get<ApiDenuncia>(`/denuncias/${id}`)
      .then(data => { if (!cancelled) { setRaw(data); setLoading(false); } })
      .catch(err  => { if (!cancelled) { setError(String(err)); setLoading(false); } });

    return () => { cancelled = true; };
  }, [id, tick]);

  return {
    complaint: raw ? mapApiDenuncia(raw) : null,
    raw,
    isLoading,
    error,
    refetch,
  };
}
