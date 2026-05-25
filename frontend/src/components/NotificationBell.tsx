import { useState, useEffect, useRef } from 'react';
import { MdNotifications, MdNotificationsNone, MdClose, MdCircle } from 'react-icons/md';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications } from '../context/NotificationContext';

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)    return 'agora';
  if (diff < 3600)  return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const { notifications, unreadCount, clearAll, markAllRead, remove } = useNotifications();
  const [open, setOpen]   = useState(false);
  const [shake, setShake] = useState(false);
  const dropdownRef       = useRef<HTMLDivElement>(null);
  const prevUnread        = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > prevUnread.current) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(t);
    }
    prevUnread.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen(v => !v);
    if (!open) markAllRead();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <motion.button
        onClick={handleOpen}
        animate={shake ? { rotate: [0, -15, 15, -10, 10, -5, 5, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="relative p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors text-white"
      >
        {unreadCount > 0
          ? <MdNotifications className="w-5 h-5" />
          : <MdNotificationsNone className="w-5 h-5" />
        }

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center px-1 text-[10px] font-bold text-white shadow"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-[600] overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900">Notificações</h3>
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <MdNotificationsNone className="w-10 h-10 text-gray-300" />
                  <p className="text-sm text-gray-400">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && (
                          <MdCircle className="w-2 h-2 text-primary flex-shrink-0 mt-1.5" />
                        )}
                        <div className={`flex-1 ${n.read ? 'pl-4' : ''}`}>
                          <p className="text-sm font-semibold text-gray-900 leading-snug">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.receivedAt)}</p>
                        </div>
                        <button
                          onClick={() => remove(n.id)}
                          className="p-0.5 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                        >
                          <MdClose className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
