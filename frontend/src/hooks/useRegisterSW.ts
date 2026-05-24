import { useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UseRegisterSWOptions {
  /** Called when the current SW has been installed and is ready for offline use. */
  onOfflineReady?: () => void;
  /** Called when a newer SW version is waiting to activate. */
  onNeedRefresh?: () => void;
  /** Called after the SW has been successfully registered. */
  onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
  /** Called if SW registration fails. */
  onRegisterError?: (error: unknown) => void;
}

export interface UseRegisterSWReturn {
  /** True when a new SW version is waiting — show an "update available" prompt. */
  needRefresh: boolean;
  /** True when the app is ready to work fully offline. */
  offlineReady: boolean;
  /**
   * Trigger SW activation.
   * @param reloadPage  Pass `true` (default) to reload after activation.
   */
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Registers the PWA service worker and exposes reactive state for
 * "offline ready" and "update available" scenarios.
 *
 * Mount this hook (via `<UpdatePrompt />`) once at the root of the app.
 */
export function useRegisterSW(
  options: UseRegisterSWOptions = {},
): UseRegisterSWReturn {
  const { onOfflineReady, onNeedRefresh, onRegistered, onRegisterError } =
    options;

  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  // Stable ref to the update function returned by registerSW
  const updateSWRef =
    useRef<((reloadPage?: boolean) => Promise<void>) | undefined>(undefined);

  useEffect(() => {
    updateSWRef.current = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
        onNeedRefresh?.();
      },
      onOfflineReady() {
        setOfflineReady(true);
        onOfflineReady?.();
      },
      onRegistered,
      onRegisterError,
    });
    // Options are captured at mount; they won't change in a stable app.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateServiceWorker = async (reloadPage = true): Promise<void> => {
    await updateSWRef.current?.(reloadPage);
    if (!reloadPage) {
      setNeedRefresh(false);
    }
  };

  return { needRefresh, offlineReady, updateServiceWorker };
}
