import { useState, useEffect } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { ReportCard } from '../ReportCard';
import { CategoryType } from '../CategoryChip';
import { EmptyState } from '../EmptyState';
import { SkeletonCard } from '../Skeleton';
import { motion } from 'motion/react';

interface MyReportsScreenProps {
  onBack: () => void;
  onReportClick: (id: string) => void;
}

const mockReports = [
  {
    id: '1',
    category: 'buraco' as CategoryType,
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600',
    address: 'Av. Paulista, 1578 - Bela Vista',
    date: '18/05/2026',
    status: 'analysis' as const
  },
  {
    id: '2',
    category: 'lixo' as CategoryType,
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600',
    address: 'Rua Augusta, 2450 - Consolação',
    date: '15/05/2026',
    status: 'open' as const
  },
  {
    id: '3',
    category: 'iluminacao' as CategoryType,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    address: 'Rua da Consolação, 3456',
    date: '10/05/2026',
    status: 'resolved' as const
  }
];

export function MyReportsScreen({ onBack, onReportClick }: MyReportsScreenProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'analysis' | 'resolved'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filteredReports = filter === 'all' ? mockReports : mockReports.filter(r => r.status === filter);

  const filterOptions = [
    { value: 'all', label: 'Todas', count: mockReports.length },
    { value: 'open', label: 'Abertas', count: mockReports.filter(r => r.status === 'open').length },
    { value: 'analysis', label: 'Em Análise', count: mockReports.filter(r => r.status === 'analysis').length },
    { value: 'resolved', label: 'Resolvidas', count: mockReports.filter(r => r.status === 'resolved').length }
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={onBack} className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
              <MdArrowBack className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h2 className="font-bold">Minhas Denúncias</h2>
              <p className="text-white/80 text-xs">{mockReports.length} denúncias registradas</p>
            </div>
          </div>

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

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
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
                transition={{ delay: i * 0.1 }}
              >
                <ReportCard {...report} onClick={() => onReportClick(report.id)} />
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
      </div>
    </div>
  );
}
