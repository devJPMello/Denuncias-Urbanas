/**
 * useNotifications
 *
 * Manages Web Push permission + subscription state.
 * Exposes enablePush / disablePush actions that call pushService and
 * keep local state in sync.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  isPushSupported,
  requestPermission,
  subscribeUser,
  unsubscribeUser,
  getSubscription,
} from '../services/pushService';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export interface UseNotificationsReturn {
  /** Current Notification API permission state */
  permission: PermissionState;
  /** Whether the device is actively subscribed to push */
  isSubscribed: boolean;
  /** True while an async operation (subscribe/unsubscribe) is in flight */
  isLoading: boolean;
  /** Request permission and subscribe to push notifications */
  enablePush: () => Promise<void>;
  /** Unsubscribe from push notifications */
  disablePush: () => Promise<void>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useNotifications(): UseNotificationsReturn {
  const { getToken } = useAuth();

  const [permission, setPermission]   = useState<PermissionState>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);

  // ── Bootstrap: read current browser state ─────────────────────────────────
  useEffect(() => {
    if (!isPushSupported()) {
      setPermission('unsupported');
      return;
    }

    setPermission(Notification.permission as PermissionState);

    getSubscription().then(sub => setIsSubscribed(!!sub));
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const enablePush = useCallback(async () => {
    setIsLoading(true);
    try {
      const perm = await requestPermission();
      setPermission(perm as PermissionState);

      if (perm !== 'granted') return;

      const token = await getToken();
      const sub = await subscribeUser(token);
      setIsSubscribed(!!sub);
    } catch (err) {
      console.error('[useNotifications] enablePush failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  const disablePush = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      await unsubscribeUser(token);
      setIsSubscribed(false);
    } catch (err) {
      console.error('[useNotifications] disablePush failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  return { permission, isSubscribed, isLoading, enablePush, disablePush };
}
