import { useState } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { ReportCard } from '../ReportCard';
import { EmptyState } from '../EmptyState';
import { SkeletonCard } from '../Skeleton';
import { motion, AnimatePresence } from 'motion/react';
import { useMyDenuncias } from '../../hooks/api/useMyDenuncias';

// ── Props ─────────────────────────────────────────────────────────────────────
interface MyReportsScreenProps {
  onBack: () => void;
  onReportClick: (id: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function MyReportsScreen({ onBack, onReportClick }: MyReportsScreenProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'analysis' | 'resolved'>('all');

  const { complaints, isLoading, error, refetch } = useMyDenuncias();

  const filteredReports =
    filter === 'all' ? complaints : complaints.filter(r => r.status === filter);

  const filterOptions = [
    { value: 'all',      label: 'Todas',      count: complaints.length },
    { value: 'open',     label: 'Abertas',    count: complaints.filter(r => r.status === 'open').length },
    { value: 'analysis', label: 'Em Análise', count: complaints.filter(r => r.status === 'analysis').length },
    { value: 'resolved', label: 'Resolvidas', count: complaints.filter(r => r.status === 'resolved').length },
  ];

  return (
    <div className="h-full flex flex-col bg-background">

      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="px-4 pt-4 pb-3">

          {/* Título */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onBack}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
            >
              <MdArrowBack className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h2 className="font-bold">Minhas Denúncias</h2>
              <p className="text-white/80 text-xs">
                {isLoading ? 'Carregando...' : `${complaints.length} denúncia${complaints.length !== 1 ? 's' : ''} registrada${complaints.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Filtros de status */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value as typeof filter)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-all font-semibold ${
                  filter === option.value
                    ? 'bg-white text-primary shadow-md'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {option.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filter === option.value ? 'bg-primary text-white' : 'bg-white/20'}`}>
                  {option.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.18 }}
          className="flex-1 overflow-y-auto p-4"
        >
          {error ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
              <p className="text-sm text-red-500 text-center">{error}</p>
              <button
                onClick={refetch}
                className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredReports.length > 0 ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredReports.map((report, i) => (
                <motion.div
                  key={report.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <ReportCard
                    id={report.id}
                    category={report.category}
                    image={report.image}
                    address={report.address}
                    date={report.date}
                    status={report.status}
                    onClick={() => onReportClick(report.id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              type="no-filter-results"
              title={filter === 'all' ? 'Nenhuma denúncia ainda' : 'Nenhuma denúncia encontrada'}
              message={filter === 'all' ? 'Comece criando sua primeira denúncia no mapa principal' : 'Tente ajustar os filtros aplicados'}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
