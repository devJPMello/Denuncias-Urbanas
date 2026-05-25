import { categoryConfig } from '../CategoryChip';
import { Badge } from '../Badge';
import type { Complaint } from '../../types';

const STATUS_LABELS = { open: 'Aberto', analysis: 'Em análise', resolved: 'Resolvido' } as const;

interface AdminCallCardProps {
  report:         Complaint;
  onOpen:         () => void;
  onStatusChange: (status: string) => void;
}

export function AdminCallCard({ report, onOpen, onStatusChange }: AdminCallCardProps) {
  const config = categoryConfig[report.category];
  const Icon = config.icon;

  return (
    <article
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden active:bg-gray-50"
      onClick={onOpen}
    >
      <div className="p-3.5">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient} flex-shrink-0`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
              {report.address}
            </p>
            <p className="text-xs text-gray-500 capitalize mt-0.5">{config.label}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge status={report.status}>{STATUS_LABELS[report.status]}</Badge>
              <span className="text-[10px] text-gray-400">{report.date}</span>
              <span className="text-[10px] text-gray-400 font-mono">#{report.id.slice(0, 8)}</span>
            </div>
          </div>
        </div>
      </div>
      <div
        className="px-3.5 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs text-gray-500 font-medium">Alterar status</span>
        <select
          value={report.status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="flex-1 max-w-[160px] px-2 py-1.5 text-xs rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="open">Aberto</option>
          <option value="analysis">Em análise</option>
          <option value="resolved">Resolvido</option>
        </select>
      </div>
    </article>
  );
}
