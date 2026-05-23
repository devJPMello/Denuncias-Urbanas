import { Badge } from './Badge';
import { categoryConfig, CategoryType } from './CategoryChip';
import { MdLocationOn, MdCalendarToday } from 'react-icons/md';

interface ReportCardProps {
  id: string;
  category: CategoryType;
  image: string;
  address: string;
  date: string;
  status: 'open' | 'analysis' | 'resolved';
  onClick?: () => void;
}

const statusLabels = {
  open: 'Aberto',
  analysis: 'Em Análise',
  resolved: 'Resolvido'
};

export function ReportCard({ category, image, address, date, status, onClick }: ReportCardProps) {
  const Icon = categoryConfig[category].icon;
  const config = categoryConfig[category];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-border overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="relative h-32">
        <img src={image} alt="Denúncia" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className={`absolute top-2 left-2 p-1.5 rounded-lg bg-gradient-to-br ${config.gradient} shadow-md`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="absolute bottom-2 left-2 right-2">
          <Badge status={status}>{statusLabels[status]}</Badge>
        </div>
      </div>

      <div className="p-3 space-y-1.5">
        <div className="flex items-start gap-1.5">
          <MdLocationOn className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <span className="text-xs font-medium text-foreground line-clamp-2">{address}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MdCalendarToday className="w-3.5 h-3.5" />
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
}
