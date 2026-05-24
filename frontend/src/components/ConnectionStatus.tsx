import { useState, useEffect } from 'react';
import { MdWifiOff, MdWifi } from 'react-icons/md';
import { motion, AnimatePresence } from 'motion/react';

export function ConnectionStatus() {
  const [isOnline, setIsOnline]   = useState(navigator.onLine);
  const [visible, setVisible]     = useState(!navigator.onLine);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const handleOnline = () => {
      setIsOnline(true);
      setVisible(true);
      // Auto-esconde o banner "conexão restaurada" após 3 s
      timer = setTimeout(() => setVisible(false), 3000);
    };

    const handleOffline = () => {
      clearTimeout(timer);
      setIsOnline(false);
      setVisible(true);
    };

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={isOnline ? 'online' : 'offline'}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          exit={{ y: 60,    opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`
            fixed bottom-4 left-1/2 -translate-x-1/2 z-[700]
            flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-xl text-white text-sm font-semibold
            ${isOnline
              ? 'bg-green-500'
              : 'bg-gray-900'
            }
          `}
        >
          {isOnline
            ? <><MdWifi    className="w-4 h-4" /> Conexão restaurada</>
            : <><MdWifiOff className="w-4 h-4" /> Sem conexão com a internet</>
          }
        </motion.div>
      )}
    </AnimatePresence>
  );
}
