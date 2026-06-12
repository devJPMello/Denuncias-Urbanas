/**
 * Push Subscription Service
 *
 * Handles Web Push permission, subscribe and unsubscribe flows.
 * Syncs subscription state with the backend via api.ts.
 *
 * Required env var: VITE_VAPID_PUBLIC_KEY (generate with `npx web-push generate-vapid-keys`)
 */

import { api } from './api';

const VAPID_PUBLIC_KEY = (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined) ?? '';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Converts a URL-safe base64 VAPID key to the Uint8Array that PushManager expects. */
function urlBase64ToUint8Array(base64: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes.buffer as ArrayBuffer;
}

/** Returns true if the browser supports push notifications. */
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Requests Notification permission from the user.
 * Returns the resulting permission state.
 */
export async function requestPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return Notification.requestPermission();
}

/**
 * Subscribes the current device to push notifications and sends the
 * subscription object to the backend (`POST /push/subscribe`).
 *
 * Returns the active PushSubscription, or null if unsupported/blocked.
 */
export async function subscribeUser(token: string | null): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  if (!VAPID_PUBLIC_KEY) {
    console.warn('[pushService] VITE_VAPID_PUBLIC_KEY is not set.');
    return null;
  }

  const registration = await navigator.serviceWorker.ready;

  // Reuse existing subscription if one already exists
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  // Sync with backend
  await api.post('/push/subscribe', subscription.toJSON(), token);

  return subscription;
}

/**
 * Unsubscribes the current device and notifies the backend
 * (`POST /push/unsubscribe`) so it can remove the stored endpoint.
 */
export async function unsubscribeUser(token: string | null): Promise<void> {
  if (!isPushSupported()) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) return;

  await subscription.unsubscribe();

  // Sync with backend
  await api.post('/push/unsubscribe', { endpoint: subscription.endpoint }, token);
}

/**
 * Returns the active PushSubscription for the current device, or null if
 * the device is not subscribed.
 */
export async function getSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

/**
 * Registers the device for push notifications linked to a specific anonymous
 * complaint. Requests permission if not yet granted. Safe to call multiple
 * times for the same complaint (backend upserts the link).
 */
export async function subscribeDenuncia(denunciaId: string): Promise<void> {
  if (!isPushSupported() || !VAPID_PUBLIC_KEY) return;

  const perm = await requestPermission();
  if (perm !== 'granted') return;

  const registration = await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  await api.post('/push/subscribe-denuncia', { ...subscription.toJSON(), denunciaId }, null);
}
