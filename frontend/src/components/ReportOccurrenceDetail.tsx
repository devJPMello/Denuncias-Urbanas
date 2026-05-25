import { CategoryType, categoryConfig } from './CategoryChip';
import { Badge } from './Badge';
import type { Complaint } from '../types';

const STATUS_LABELS = {
  open:     'Aberto',
  analysis: 'Em análise',
  resolved: 'Resolvido',
} as const;

/** Chip de categoria (fundo claro + texto colorido). */
const CATEGORY_PILL: Record<CategoryType, string> = {
  buraco:     'bg-red-100 text-red-800',
  lixo:       'bg-amber-100 text-amber-800',
  iluminacao: 'bg-blue-100 text-blue-800',
  calcada:    'bg-orange-100 text-orange-800',
  vandalismo: 'bg-violet-100 text-violet-800',
  outros:     'bg-gray-100 text-gray-700',
};

interface ReportOccurrenceDetailProps {
  report:    Complaint;
  className?: string;
}

/**
 * Layout padrão de detalhe: ícone + título + endereço + linha (status · data · categoria).
 */
export function ReportOccurrenceDetail({ report, className = '' }: ReportOccurrenceDetailProps) {
  const config = categoryConfig[report.category];
  const Icon = config.icon;
  const headline =
    report.title?.trim() ||
    `${config.label} — denúncia`;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient} shadow-md flex-shrink-0`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 leading-snug">{headline}</p>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{report.address}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge status={report.status}>{STATUS_LABELS[report.status]}</Badge>
        <span className="text-xs text-gray-500">{report.date}</span>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_PILL[report.category]}`}
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
          className="w-full max-h-44 object-cover rounded-xl border border-gray-100"
        />
      )}
    </div>
  );
}
