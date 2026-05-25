/**
 * useMyDenuncias — denúncias do usuário autenticado (/denuncias/mine).
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../../services/api';
import { ApiDenuncia, Complaint, mapApiDenuncia } from '../../types';

interface UseMyDenunciasResult {
  complaints: Complaint[];
  raw:        ApiDenuncia[];
  isLoading:  boolean;
  error:      string | null;
  refetch:    () => void;
}

export function useMyDenuncias(): UseMyDenunciasResult {
  const { getToken, isSignedIn } = useAuth();
  const [raw, setRaw]           = useState<ApiDenuncia[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [tick, setTick]         = useState(0);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!isSignedIn) {
      setRaw([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    getToken()
      .then(token => api.get<ApiDenuncia[]>('/denuncias/mine', token))
      .then(data  => { if (!cancelled) { setRaw(data); setLoading(false); } })
      .catch(err  => { if (!cancelled) { setError(String(err)); setLoading(false); } });

    return () => { cancelled = true; };
  }, [isSignedIn, tick]);

  return { complaints: raw.map(mapApiDenuncia), raw, isLoading, error, refetch };
}
