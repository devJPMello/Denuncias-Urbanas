import { MdBarChart, MdListAlt, MdMap } from 'react-icons/md';

export type AdminView = 'map' | 'calls' | 'reports';

interface AdminBottomNavProps {
  current: AdminView;
  onChange: (view: AdminView) => void;
}

const TABS: { view: AdminView; label: string; icon: typeof MdListAlt }[] = [
  { view: 'calls',   label: 'Chamados',   icon: MdListAlt },
  { view: 'map',     label: 'Mapa',       icon: MdMap },
  { view: 'reports', label: 'Relatórios', icon: MdBarChart },
];

export function AdminBottomNav({ current, onChange }: AdminBottomNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch justify-around px-1 pt-1">
        {TABS.map(({ view, label, icon: Icon }) => {
          const active = current === view;
          return (
            <button
              key={view}
              type="button"
              onClick={() => onChange(view)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-lg transition-colors ${
                active ? 'text-primary' : 'text-gray-500'
              }`}
            >
              <Icon className={`w-6 h-6 ${active ? 'scale-110' : ''}`} />
              <span className={`text-[10px] font-semibold ${active ? 'text-primary' : ''}`}>
                {label}
              </span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-primary mt-0.5" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
