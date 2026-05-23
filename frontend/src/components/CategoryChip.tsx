import { MdWarning, MdDelete, MdLightbulb, MdDirectionsWalk, MdMoreHoriz } from 'react-icons/md';

export type CategoryType = 'buraco' | 'lixo' | 'iluminacao' | 'calcada' | 'outros';

interface CategoryChipProps {
  category: CategoryType;
  selected?: boolean;
  onClick?: () => void;
}

const categoryConfig = {
  buraco: {
    icon: MdWarning,
    label: 'Buraco',
    color: 'var(--category-buraco)',
    gradient: 'from-red-500 to-red-600'
  },
  lixo: {
    icon: MdDelete,
    label: 'Lixo',
    color: 'var(--category-lixo)',
    gradient: 'from-amber-500 to-orange-500'
  },
  iluminacao: {
    icon: MdLightbulb,
    label: 'Iluminação',
    color: 'var(--category-iluminacao)',
    gradient: 'from-blue-500 to-blue-600'
  },
  calcada: {
    icon: MdDirectionsWalk,
    label: 'Calçada',
    color: 'var(--category-calcada)',
    gradient: 'from-orange-500 to-orange-600'
  },
  outros: {
    icon: MdMoreHoriz,
    label: 'Outros',
    color: 'var(--category-outros)',
    gradient: 'from-gray-500 to-gray-600'
  }
};

export function CategoryChip({ category, selected = false, onClick }: CategoryChipProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
        selected
          ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg scale-105'
          : 'border-border bg-white hover:border-primary/30 hover:shadow-md'
      }`}
    >
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${config.gradient} shadow-md`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <span className="text-sm font-medium">{config.label}</span>
    </button>
  );
}

export { categoryConfig };
