/**
 * useNotifications — Web Push permission + subscription (sem autenticação).
 */
import { useState, useEffect, useCallback } from 'react';
import {
  isPushSupported,
  requestPermission,
  subscribeUser,
  unsubscribeUser,
  getSubscription,
} from '../services/pushService';

export type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export interface UseNotificationsReturn {
  permission:   PermissionState;
  isSubscribed: boolean;
  isLoading:    boolean;
  enablePush:   () => Promise<void>;
  disablePush:  () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission]     = useState<PermissionState>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);

  useEffect(() => {
    if (!isPushSupported()) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as PermissionState);
    getSubscription().then(sub => setIsSubscribed(!!sub));
  }, []);

  const enablePush = useCallback(async () => {
    setIsLoading(true);
    try {
      const perm = await requestPermission();
      setPermission(perm as PermissionState);
      if (perm !== 'granted') return;
      const sub = await subscribeUser(null);
      setIsSubscribed(!!sub);
    } catch (err) {
      console.error('[useNotifications] enablePush failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disablePush = useCallback(async () => {
    setIsLoading(true);
    try {
      await unsubscribeUser(null);
      setIsSubscribed(false);
    } catch (err) {
      console.error('[useNotifications] disablePush failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { permission, isSubscribed, isLoading, enablePush, disablePush };
}
