import { MdLogout, MdLocationOn } from 'react-icons/md';
import type { AdminView } from './AdminBottomNav';

const TITLES: Record<AdminView, { title: string; subtitle: string }> = {
  calls:   { title: 'Fila de Chamados',      subtitle: 'Gerencie as denúncias da cidade' },
  map:     { title: 'Mapa de Ocorrências',   subtitle: 'Visualização geográfica' },
  reports: { title: 'Relatórios',            subtitle: 'Indicadores e análises' },
};

interface AdminMobileHeaderProps {
  view:       AdminView;
  meta?:      string;
  onLogout?:  () => void;
}

export function AdminMobileHeader({ view, meta, onLogout }: AdminMobileHeaderProps) {
  const { title, subtitle } = TITLES[view];

  return (
    <header
      className="md:hidden bg-gradient-to-r from-primary to-blue-600 text-white flex-shrink-0"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="px-4 py-3.5 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
          <MdLocationOn className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base leading-tight truncate">{title}</h2>
          <p className="text-white/80 text-xs truncate">{meta ?? subtitle}</p>
        </div>
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="p-2.5 bg-white/15 rounded-xl hover:bg-white/25 transition-colors flex-shrink-0"
            aria-label="Sair"
          >
            <MdLogout className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
}
