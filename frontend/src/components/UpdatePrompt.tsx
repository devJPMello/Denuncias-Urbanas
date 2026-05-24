import { useState } from 'react';
import { RefreshCw, WifiOff, X } from 'lucide-react';
import { useRegisterSW } from '@/hooks/useRegisterSW';

/**
 * Floating bottom-bar that handles two PWA lifecycle events:
 *
 *  • **Offline ready** — shown briefly when the app first becomes cacheable.
 *  • **Update available** — shown whenever a new SW version is waiting;
 *    lets the user reload immediately or dismiss.
 *
 * Mount this component once at the root of the app (e.g. inside App.tsx).
 */
export function UpdatePrompt() {
  const [dismissed, setDismissed] = useState(false);
  const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW();

  const visible = !dismissed && (needRefresh || offlineReady);
  if (!visible) return null;

  const isUpdate = needRefresh;

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'fixed bottom-4 left-4 right-4 z-[9999] flex items-center gap-3',
        'rounded-xl px-4 py-3 shadow-xl',
        'md:left-auto md:right-4 md:w-96',
        isUpdate
          ? 'bg-primary text-primary-foreground'
          : 'bg-accent text-accent-foreground',
      ].join(' ')}
    >
      {/* Icon */}
      {isUpdate ? (
        <RefreshCw className="h-5 w-5 shrink-0 animate-spin-once" />
      ) : (
        <WifiOff className="h-5 w-5 shrink-0" />
      )}

      {/* Message */}
      <span className="flex-1 text-sm font-medium leading-snug">
        {isUpdate
          ? 'Nova versão disponível!'
          : 'App pronto para uso offline.'}
      </span>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {isUpdate && (
          <button
            onClick={() => updateServiceWorker(true)}
            className="rounded-lg bg-white/20 px-3 py-1 text-sm font-semibold hover:bg-white/30 active:bg-white/40 transition-colors"
          >
            Atualizar
          </button>
        )}

        <button
          onClick={() => setDismissed(true)}
          aria-label="Fechar notificação"
          className="rounded-lg p-1 hover:bg-white/20 active:bg-white/30 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
