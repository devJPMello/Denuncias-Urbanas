import { useState, useEffect } from 'react';
import { MdGetApp, MdClose } from 'react-icons/md';
import { motion, AnimatePresence } from 'motion/react';
import type { BeforeInstallPromptEvent } from '../types';

const DISMISSED_KEY = 'pwa-install-dismissed';

/** Verifica se o app já está rodando em modo standalone (já instalado). */
function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

export function InstallPWAPrompt() {
  const [prompt,    setPrompt]    = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === 'true' || isStandalone(),
  );

  useEffect(() => {
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissed]);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setPrompt(null);
    localStorage.setItem(DISMISSED_KEY, 'true');
  };

  return (
    <AnimatePresence>
      {prompt && !dismissed && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          exit={{ y: 80,    opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="fixed bottom-4 left-4 right-4 z-[700] mx-auto max-w-sm"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 flex items-center gap-3">
            {/* Ícone */}
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/30">
              <MdGetApp className="w-6 h-6 text-white" />
            </div>

            {/* Texto */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">Instalar o app</p>
              <p className="text-xs text-gray-500 mt-0.5">Acesso rápido e funciona offline</p>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleInstall}
                className="px-3 py-1.5 bg-gradient-to-r from-primary to-blue-600 text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Instalar
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MdClose className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
