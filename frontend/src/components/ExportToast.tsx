import { motion, AnimatePresence } from 'motion/react';
import { MdCheckCircle, MdClose } from 'react-icons/md';

interface ExportToastProps {
  show: boolean;
  format: string;
  onClose: () => void;
}

export function ExportToast({ show, format, onClose }: ExportToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 pr-12 min-w-[320px]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <MdCheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 mb-1">Exportação Concluída!</p>
                <p className="text-sm text-gray-600">
                  Arquivo {format.toUpperCase()} baixado com sucesso
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MdClose className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
