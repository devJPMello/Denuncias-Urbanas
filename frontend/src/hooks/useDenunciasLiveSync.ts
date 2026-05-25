/**
 * Atualiza a lista do painel municipal em tempo real (sem login / sem role admin).
 * Conecta ao socket em modo municipal-panel e invalida o cache ao criar/alterar denúncia.
 */
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { municipalSocketService } from '../services/socketService';

export function useDenunciasLiveSync(enabled = true): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    municipalSocketService.connectMunicipalPanel();

    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: ['denuncias'] });
    };

    municipalSocketService.on('complaint:created', refresh);
    municipalSocketService.on('complaint:updated', refresh);

    return () => {
      municipalSocketService.off('complaint:created', refresh);
      municipalSocketService.off('complaint:updated', refresh);
      municipalSocketService.disconnect();
    };
  }, [enabled, queryClient]);
}
