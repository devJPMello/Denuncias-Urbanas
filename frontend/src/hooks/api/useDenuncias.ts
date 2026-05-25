/**
 * useDenuncias — carrega todas as denúncias (mapa público e painel admin).
 */
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { ApiDenuncia, Complaint, mapApiDenuncia } from '../../types';

interface UseDenunciasResult {
  complaints: Complaint[];
  raw:        ApiDenuncia[];
  isLoading:  boolean;
  error:      string | null;
  refetch:    () => void;
}

export function useDenuncias(): UseDenunciasResult {
  const [raw, setRaw]           = useState<ApiDenuncia[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [tick, setTick]         = useState(0);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    api.get<ApiDenuncia[]>('/denuncias')
      .then(data => { if (!cancelled) { setRaw(data); setLoading(false); } })
      .catch(err  => { if (!cancelled) { setError(String(err)); setLoading(false); } });

    return () => { cancelled = true; };
  }, [tick]);

  return { complaints: raw.map(mapApiDenuncia), raw, isLoading, error, refetch };
}
