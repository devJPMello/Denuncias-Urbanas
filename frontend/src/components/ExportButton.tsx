import { useState, useRef, useEffect } from 'react';
import { MdDownload, MdCheckCircle, MdPictureAsPdf, MdTableChart, MdDescription } from 'react-icons/md';
import { motion, AnimatePresence } from 'motion/react';
import { ExportToast } from './ExportToast';

interface ExportButtonProps {
  onExport?: (format: 'pdf' | 'excel' | 'csv') => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function ExportButton({ onExport, variant = 'secondary', size = 'sm' }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [lastFormat, setLastFormat] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const exportOptions = [
    { format: 'pdf' as const, label: 'PDF', description: 'Documento portátil', icon: MdPictureAsPdf, color: 'from-red-500 to-red-600' },
    { format: 'excel' as const, label: 'Excel', description: 'Planilha editável', icon: MdTableChart, color: 'from-green-500 to-green-600' },
    { format: 'csv' as const, label: 'CSV', description: 'Dados separados por vírgula', icon: MdDescription, color: 'from-blue-500 to-blue-600' }
  ];

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsOpen(false);
    setIsExporting(true);
    setLastFormat(format);
    setProgress(0);

    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setProgress((i / steps) * 100);
    }

    if (onExport) onExport(format);

    setIsExporting(false);
    setExportSuccess(true);
    setShowToast(true);

    setTimeout(() => { setExportSuccess(false); setProgress(0); }, 2000);
    setTimeout(() => { setShowToast(false); }, 4000);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const sizeClasses = { sm: 'px-3 py-2 text-sm', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-base' };
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-lg',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
  };

  if (exportSuccess) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`inline-flex items-center gap-2 ${sizeClasses[size]} bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold shadow-md`}
      >
        <MdCheckCircle className="w-5 h-5" />
        Exportado!
      </motion.div>
    );
  }

  if (isExporting) {
    return (
      <div className={`inline-flex items-center gap-3 ${sizeClasses[size]} ${variantClasses[variant]} rounded-lg font-semibold transition-all`}>
        <div className="relative w-5 h-5">
          <svg className="w-5 h-5 transform -rotate-90">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-20" />
            <circle
              cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none"
              strokeDasharray={`${2 * Math.PI * 8}`}
              strokeDashoffset={`${2 * Math.PI * 8 * (1 - progress / 100)}`}
              className="transition-all duration-100"
            />
          </svg>
        </div>
        <span>Exportando... {Math.round(progress)}%</span>
      </div>
    );
  }

  return (
    <>
      <ExportToast show={showToast} format={lastFormat} onClose={() => setShowToast(false)} />
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-2 ${sizeClasses[size]} ${variantClasses[variant]} rounded-lg font-semibold transition-all ${isOpen ? 'shadow-lg' : ''}`}
        >
          <MdDownload className="w-5 h-5" />
          Exportar
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
            >
              <div className="p-2">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Escolha o formato</p>
                </div>
                <div className="py-1 space-y-1">
                  {exportOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.format}
                        onClick={() => handleExport(option.format)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <div className={`p-2 bg-gradient-to-br ${option.color} rounded-lg shadow-sm group-hover:shadow-md transition-shadow`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                          <p className="text-xs text-gray-500">{option.description}</p>
                        </div>
                        <MdDownload className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
