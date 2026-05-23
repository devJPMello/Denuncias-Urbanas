import { useState, useRef, useEffect } from 'react';
import { MdLocationOn, MdBarChart, MdMenu, MdClose, MdSearch, MdNotifications, MdPerson, MdTrendingUp, MdLogout, MdSettings } from 'react-icons/md';
import { Badge } from '../Badge';
import { CategoryType, categoryConfig } from '../CategoryChip';
import { ExportButton } from '../ExportButton';
import { SkeletonTable } from '../Skeleton';
import { motion, AnimatePresence } from 'motion/react';
import { MapAdminScreen } from './MapAdminScreen';
import { ReportsScreen } from './ReportsScreen';

const mockReports = [
  { id: '1', category: 'buraco' as CategoryType, address: 'Av. Paulista, 1578 - Bela Vista', date: '18/05/2026', status: 'analysis' as const, neighborhood: 'Bela Vista' },
  { id: '2', category: 'lixo' as CategoryType, address: 'Rua Augusta, 2450 - Consolação', date: '15/05/2026', status: 'open' as const, neighborhood: 'Consolação' },
  { id: '3', category: 'iluminacao' as CategoryType, address: 'Rua da Consolação, 3456', date: '10/05/2026', status: 'resolved' as const, neighborhood: 'Consolação' },
  { id: '4', category: 'calcada' as CategoryType, address: 'Av. Rebouças, 1000', date: '12/05/2026', status: 'open' as const, neighborhood: 'Pinheiros' }
];

const statusLabels = { open: 'Aberto', analysis: 'Em Análise', resolved: 'Resolvido' };
type AdminView = 'map' | 'calls' | 'reports';

interface AdminPanelScreenProps {
  onLogout?: () => void;
}

export function AdminPanelScreen({ onLogout }: AdminPanelScreenProps) {
  const [currentView, setCurrentView] = useState<AdminView>('calls');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'analysis' | 'resolved'>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const filteredReports = mockReports.filter(report => {
    const statusMatch = selectedStatus === 'all' || report.status === selectedStatus;
    const categoryMatch = selectedCategory === 'all' || report.category === selectedCategory;
    const searchMatch = !search || report.address.toLowerCase().includes(search.toLowerCase());
    return statusMatch && categoryMatch && searchMatch;
  });

  const stats = {
    total: mockReports.length,
    open: mockReports.filter(r => r.status === 'open').length,
    analysis: mockReports.filter(r => r.status === 'analysis').length,
    resolved: mockReports.filter(r => r.status === 'resolved').length
  };

  const statCards = [
    { label: 'Total', value: stats.total, gradient: 'from-primary to-blue-600', shadow: 'shadow-primary/20' },
    { label: 'Abertos', value: stats.open, gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
    { label: 'Em análise', value: stats.analysis, gradient: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/20' },
    { label: 'Resolvidos', value: stats.resolved, gradient: 'from-green-500 to-emerald-500', shadow: 'shadow-green-500/20' }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (currentView === 'calls') {
      setIsLoadingTable(true);
      const timer = setTimeout(() => setIsLoadingTable(false), 800);
      return () => clearTimeout(timer);
    }
  }, [selectedStatus, selectedCategory, search, currentView]);

  return (
    <div className="h-full flex bg-gray-50 overflow-hidden">
      {/* Overlay mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-56 bg-white border-r border-border flex flex-col
        transition-transform duration-300
        md:relative md:translate-x-0 md:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="px-4 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-2 shadow-md shadow-primary/30">
              <MdLocationOn className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm">Painel</h1>
              <p className="text-[11px] text-muted-foreground">Municipal</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <MdClose className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {[
            { icon: MdLocationOn, label: 'Mapa', view: 'map' as AdminView },
            { icon: MdMenu, label: 'Chamados', view: 'calls' as AdminView },
            { icon: MdBarChart, label: 'Relatórios', view: 'reports' as AdminView }
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => { setCurrentView(item.view); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-semibold ${
                currentView === item.view
                  ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-md shadow-primary/30'
                  : 'text-foreground hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto p-3 border-t border-border">
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <MdPerson className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold truncate">Equipe Municipal</p>
                <p className="text-[10px] text-muted-foreground truncate">admin@sp.gov.br</p>
              </div>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
                >
                  <div className="p-1">
                    <button
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                        <MdSettings className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Configurações</p>
                        <p className="text-xs text-gray-500">Preferências do painel</p>
                      </div>
                    </button>
                    <div className="h-px bg-gray-100 my-1" />
                    <button
                      onClick={() => { setShowProfileMenu(false); onLogout?.(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-lg transition-colors text-left group"
                    >
                      <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg group-hover:shadow-md transition-shadow">
                        <MdLogout className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-600 group-hover:text-red-700">Sair</p>
                        <p className="text-xs text-red-500/80">Voltar para login</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {currentView !== 'reports' && (
          <header className="bg-gradient-to-r from-primary to-blue-600 text-white">
            <div className="px-4 py-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors flex-shrink-0"
                >
                  <MdMenu className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <h2 className="font-bold truncate">
                    {currentView === 'map' ? 'Mapa de Ocorrências' : 'Fila de Chamados'}
                  </h2>
                  <p className="text-white/80 text-xs truncate">
                    {currentView === 'map' ? 'Visualização geográfica' : `${filteredReports.length} chamado(s)`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors relative">
                  <MdNotifications className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <ExportButton variant="secondary" size="sm" onExport={(format) => console.log(`Exportando em ${format}`)} />
              </div>
            </div>
          </header>
        )}

        {currentView === 'map' ? (
          <MapAdminScreen />
        ) : currentView === 'reports' ? (
          <ReportsScreen />
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {statCards.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-gradient-to-br ${stat.gradient} text-white rounded-xl p-3 shadow-lg ${stat.shadow}`}
                >
                  <p className="text-xs text-white/80 font-medium">{stat.label}</p>
                  <div className="flex items-end justify-between mt-1">
                    <p className="font-bold">{stat.value}</p>
                    <MdTrendingUp className="w-4 h-4 text-white/60" />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-border p-3">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por endereço..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as typeof selectedStatus)} className="px-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                  <option value="all">Todos os status</option>
                  <option value="open">Abertos</option>
                  <option value="analysis">Em Análise</option>
                  <option value="resolved">Resolvidos</option>
                </select>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as typeof selectedCategory)} className="px-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                  <option value="all">Todas categorias</option>
                  <option value="buraco">Buraco</option>
                  <option value="lixo">Lixo</option>
                  <option value="iluminacao">Iluminação</option>
                  <option value="calcada">Calçada</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
            </div>

            {isLoadingTable ? (
              <SkeletonTable rows={8} />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      {['ID', 'Categoria', 'Endereço', 'Bairro', 'Data', 'Status', 'Ação'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => {
                      const Icon = categoryConfig[report.category].icon;
                      const config = categoryConfig[report.category];
                      return (
                        <tr key={report.id} className="border-t border-border hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2.5 text-sm font-medium text-gray-500">#{report.id}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${config.gradient}`}>
                                <Icon className="w-3.5 h-3.5 text-white" />
                              </div>
                              <span className="text-sm capitalize">{report.category}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-sm text-gray-700">{report.address}</td>
                          <td className="px-4 py-2.5 text-sm text-gray-700">{report.neighborhood}</td>
                          <td className="px-4 py-2.5 text-sm text-gray-500">{report.date}</td>
                          <td className="px-4 py-2.5"><Badge status={report.status}>{statusLabels[report.status]}</Badge></td>
                          <td className="px-4 py-2.5">
                            <select className="px-2 py-1 text-xs rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
                              <option>Alterar</option>
                              <option>Aberto</option>
                              <option>Em Análise</option>
                              <option>Resolvido</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredReports.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">Nenhum chamado encontrado</div>
                )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {currentView === 'calls' && (
        <aside className="hidden xl:block w-72 bg-white border-l border-border p-4 space-y-3 overflow-y-auto">
          <div>
            <h3 className="font-bold text-sm mb-2 text-gray-900">Mapa de Calor</h3>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl h-44 flex items-center justify-center border border-blue-100 relative overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-10">
                {Array.from({ length: 64 }).map((_, i) => <div key={i} className="border border-gray-300" />)}
              </div>
              <div className="text-center relative z-10">
                <MdLocationOn className="w-10 h-10 text-primary mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-700">Concentração</p>
                <p className="text-[11px] text-gray-500">de denúncias</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-2 text-gray-900">Bairros Principais</h3>
            <div className="space-y-2">
              {[
                { name: 'Bela Vista', count: 8, gradient: 'from-red-500 to-red-600' },
                { name: 'Consolação', count: 5, gradient: 'from-amber-500 to-orange-500' },
                { name: 'Pinheiros', count: 3, gradient: 'from-green-500 to-emerald-500' }
              ].map((n) => (
                <div key={n.name} className="flex items-center justify-between p-2.5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${n.gradient}`} />
                    <span className="text-sm font-medium text-gray-900">{n.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 bg-gradient-to-r ${n.gradient} text-white rounded-full text-xs font-semibold`}>{n.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-2 text-gray-900">Atividade Recente</h3>
            <div className="space-y-2">
              {[
                { text: 'Chamado #1 atualizado', time: '5min', color: 'bg-blue-500' },
                { text: 'Novo chamado em Pinheiros', time: '1h', color: 'bg-amber-500' },
                { text: 'Chamado #3 resolvido', time: '2h', color: 'bg-green-500' }
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-xl">
                  <div className={`w-2 h-2 ${a.color} rounded-full mt-1.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{a.text}</p>
                    <p className="text-[10px] text-gray-500">há {a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
