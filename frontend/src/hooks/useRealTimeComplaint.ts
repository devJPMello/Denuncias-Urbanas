/**
 * useRealTimeComplaint
 *
 * Escuta o evento `complaint:updated` do WebSocket e retorna o status
 * mais recente de uma denúncia específica.
 *
 * Retorna `null` enquanto nenhuma atualização em tempo real for recebida
 * — nesse caso a UI deve continuar mostrando o valor já carregado.
 */

import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

// ── Payload do evento (espelha o backend) ─────────────────────────────────────

export interface ComplaintUpdatedPayload {
  denunciaId: string;
  status:     string;   // valores do backend: aberto | analise | resolvido | cancelado
  updatedAt:  string;   // ISO 8601
}

// ── Mapeamento backend → frontend ────────────────────────────────────────────

const STATUS_MAP: Record<string, 'open' | 'analysis' | 'resolved'> = {
  aberto:    'open',
  analise:   'analysis',
  resolvido: 'resolved',
};

export type FrontendStatus = 'open' | 'analysis' | 'resolved';

export interface UseRealTimeComplaintReturn {
  /** Status atualizado em tempo real (null = sem atualização recebida ainda) */
  liveStatus:    FrontendStatus | null;
  /** Data/hora da última atualização recebida */
  liveUpdatedAt: Date | null;
  /** True quando pelo menos uma atualização foi recebida */
  hasLiveUpdate: boolean;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useRealTimeComplaint(denunciaId: string): UseRealTimeComplaintReturn {
  const [liveStatus,    setLiveStatus]    = useState<FrontendStatus | null>(null);
  const [liveUpdatedAt, setLiveUpdatedAt] = useState<Date | null>(null);

  const { subscribe, unsubscribe } = useSocket();

  useEffect(() => {
    const handler = (payload: ComplaintUpdatedPayload) => {
      if (payload.denunciaId !== denunciaId) return;

      const mapped = STATUS_MAP[payload.status] ?? null;
      if (mapped) setLiveStatus(mapped);
      setLiveUpdatedAt(new Date(payload.updatedAt));
    };

    subscribe<ComplaintUpdatedPayload>('complaint:updated', handler);
    return () => unsubscribe<ComplaintUpdatedPayload>('complaint:updated', handler);
  }, [denunciaId, subscribe, unsubscribe]);

  return {
    liveStatus,
    liveUpdatedAt,
    hasLiveUpdate: liveStatus !== null,
  };
}
