import { MdClose, MdSearch } from 'react-icons/md';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryType, categoryConfig } from './CategoryChip';
import { Badge } from './Badge';
import type { Complaint } from '../types';

const STATUS_LABELS = {
  open:     'Aberto',
  analysis: 'Em análise',
  resolved: 'Resolvido',
} as const;

export type MobileSheetMode = 'closed' | 'list' | 'detail';

interface MobileOccurrenceSheetProps {
  mode:           MobileSheetMode;
  selected:       Complaint | null;
  reports:        Complaint[];
  isLoading:      boolean;
  searchQuery:    string;
  categoryColors: Record<CategoryType, string>;
  onSearchChange: (q: string) => void;
  onOpenList:     () => void;
  onSelect:       (report: Complaint) => void;
  onClose:        () => void;
}

export function MobileOccurrenceSheet({
  mode,
  selected,
  reports,
  isLoading,
  searchQuery,
  categoryColors,
  onSearchChange,
  onOpenList,
  onSelect,
  onClose,
}: MobileOccurrenceSheetProps) {
  const isOpen = mode !== 'closed';

  return (
    <>
      {/* Barra recolhida — estilo Maps */}
      <AnimatePresence>
        {mode === 'closed' && (
          <motion.button
            type="button"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            onClick={onOpenList}
            className="md:hidden fixed bottom-0 left-0 right-0 z-[420] mx-3 mb-3 flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] border border-gray-100"
          >
            <div className="text-left">
              <p className="font-bold text-sm text-gray-900">Ocorrências Próximas</p>
              <p className="text-xs text-gray-500">
                {reports.length === 0 ? 'Nenhuma no mapa' : `${reports.length} registro(s)`}
              </p>
            </div>
            <span className="text-xs font-medium text-primary">Ver lista</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Overlay + painel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-[500] bg-black/40"
              onClick={onClose}
            />
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-[510] flex flex-col bg-white rounded-t-2xl shadow-2xl max-h-[min(85vh,640px)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-300" aria-hidden />
              </div>

              <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
                <h3 className="font-bold text-sm text-gray-900">
                  {mode === 'detail' ? 'Detalhe da ocorrência' : 'Ocorrências Próximas'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                  aria-label="Fechar"
                >
                  <MdClose className="w-5 h-5" />
                </button>
              </div>

              {mode === 'list' && (
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por localização..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto min-h-0">
                {mode === 'detail' && selected ? (
                  <OccurrenceDetail
                    report={selected}
                    categoryColors={categoryColors}
                  />
                ) : (
                  <OccurrenceList
                    reports={reports}
                    isLoading={isLoading}
                    categoryColors={categoryColors}
                    onSelect={onSelect}
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function OccurrenceList({
  reports,
  isLoading,
  categoryColors,
  onSelect,
}: {
  reports:        Complaint[];
  isLoading:      boolean;
  categoryColors: Record<CategoryType, string>;
  onSelect:       (r: Complaint) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (reports.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-10 px-4">Nenhuma ocorrência encontrada</p>;
  }

  return (
    <div className="p-3 space-y-2 pb-6">
      {reports.map((report) => (
        <button
          key={report.id}
          type="button"
          onClick={() => onSelect(report)}
          className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 text-left active:bg-gray-100"
        >
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: categoryColors[report.category] }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{report.address}</p>
            <p className="text-xs text-gray-500 capitalize">{report.category}</p>
          </div>
          <span className="text-[11px] text-gray-400">{report.date}</span>
        </button>
      ))}
    </div>
  );
}

function OccurrenceDetail({
  report,
  categoryColors,
}: {
  report:         Complaint;
  categoryColors: Record<CategoryType, string>;
}) {
  const config = categoryConfig[report.category];
  const Icon = config.icon;

  return (
    <div className="p-4 pb-8 space-y-4">
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient} shadow-md flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 leading-snug">
            {report.title ?? config.label}
          </p>
          <p className="text-sm text-gray-600 mt-1">{report.address}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge status={report.status}>{STATUS_LABELS[report.status]}</Badge>
        <span className="text-xs text-gray-500">{report.date}</span>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full capitalize"
          style={{ background: `${categoryColors[report.category]}22`, color: categoryColors[report.category] }}
        >
          {config.label}
        </span>
      </div>

      {report.description && (
        <p className="text-sm text-gray-600 leading-relaxed">{report.description}</p>
      )}

      {report.image && (
        <img
          src={report.image}
          alt="Foto da ocorrência"
          className="w-full max-h-40 object-cover rounded-xl border border-gray-100"
        />
      )}
    </div>
  );
}
