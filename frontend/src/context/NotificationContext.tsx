import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAuthSocketConnection } from '../hooks/useAuthSocketConnection';
import type { AppNotification, NotificationNewPayload } from '../types';

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount:     number;
  clearAll:        () => void;
  markAllRead:     () => void;
  remove:          (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  useAuthSocketConnection();
  const { subscribe, unsubscribe } = useSocket();

  useEffect(() => {
    const handler = (payload: NotificationNewPayload) => {
      setNotifications(prev => [
        {
          id:         crypto.randomUUID(),
          title:      payload.title,
          body:       payload.body,
          denunciaId: payload.denunciaId,
          receivedAt: new Date(),
          read:       false,
        },
        ...prev,
      ].slice(0, 50));
    };

    subscribe<NotificationNewPayload>('notification:new', handler);
    return () => unsubscribe<NotificationNewPayload>('notification:new', handler);
  }, [subscribe, unsubscribe]);

  const clearAll = useCallback(() => setNotifications([]), []);

  const markAllRead = useCallback(
    () => setNotifications(prev => prev.map(n => ({ ...n, read: true }))),
    [],
  );

  const remove = useCallback(
    (id: string) => setNotifications(prev => prev.filter(n => n.id !== id)),
    [],
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = useMemo(
    () => ({ notifications, unreadCount, clearAll, markAllRead, remove }),
    [notifications, unreadCount, clearAll, markAllRead, remove],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications deve estar dentro de NotificationProvider');
  }
  return ctx;
}
