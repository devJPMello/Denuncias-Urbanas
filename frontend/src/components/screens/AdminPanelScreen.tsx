import { useState, useRef, useEffect } from 'react';
import {
  MdLocationOn, MdBarChart, MdMenu, MdClose, MdSearch,
  MdPerson, MdTrendingUp, MdLogout,
  MdCloudUpload, MdCheckCircle, MdChevronLeft, MdChevronRight,
} from 'react-icons/md';
import { Badge } from '../Badge';
import { CategoryType, categoryConfig } from '../CategoryChip';
import { SkeletonTable } from '../Skeleton';
import { Modal } from '../Modal';
import { motion, AnimatePresence } from 'motion/react';
import { MapAdminScreen } from './MapAdminScreen';
import { ReportsScreen } from './ReportsScreen';

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockReports = [
  { id: '1', category: 'buraco' as CategoryType, address: 'Av. Paulista, 1578 - Bela Vista',      date: '18/05/2026', status: 'analysis' as const, neighborhood: 'Bela Vista'  },
  { id: '2', category: 'lixo'  as CategoryType, address: 'Rua Augusta, 2450 - Consolação',        date: '15/05/2026', status: 'open'     as const, neighborhood: 'Consolação'  },
  { id: '3', category: 'iluminacao' as CategoryType, address: 'Rua da Consolação, 3456',          date: '10/05/2026', status: 'resolved' as const, neighborhood: 'Consolação'  },
  { id: '4', category: 'calcada' as CategoryType, address: 'Av. Rebouças, 1000',                  date: '12/05/2026', status: 'open'     as const, neighborhood: 'Pinheiros'   },
];

type Report = typeof mockReports[0];

const statusLabels = { open: 'Aberto', analysis: 'Em Análise', resolved: 'Resolvido' };
type AdminView = 'map' | 'calls' | 'reports';

// ── Component ─────────────────────────────────────────────────────────────────

interface AdminPanelScreenProps {
  onLogout?: () => void;
}

export function AdminPanelScreen({ onLogout }: AdminPanelScreenProps) {
  // ── Existing UI state ──────────────────────────────────────────────────────
  const [currentView, setCurrentView]         = useState<AdminView>('calls');
  const [selectedStatus, setSelectedStatus]   = useState<'all' | 'open' | 'analysis' | 'resolved'>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [search, setSearch]                   = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoadingTable, setIsLoadingTable]   = useState(false);
  // Inicia aberta no desktop, fechada no mobile
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768,
  );
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // ── Finalize-report modal state ────────────────────────────────────────────
  const [selectedReport, setSelectedReport]   = useState<Report | null>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [imagePreview, setImagePreview]       = useState<string | null>(null);
  const [observation, setObservation]         = useState('');
  const [isDragging, setIsDragging]           = useState(false);
  const [isFinalized, setIsFinalized]         = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Derived data ───────────────────────────────────────────────────────────
  const filteredReports = mockReports.filter(report => {
    const statusMatch   = selectedStatus   === 'all' || report.status   === selectedStatus;
    const categoryMatch = selectedCategory === 'all' || report.category === selectedCategory;
    const searchMatch   = !search || report.address.toLowerCase().includes(search.toLowerCase());
    return statusMatch && categoryMatch && searchMatch;
  });

  const stats = {
    total:    mockReports.length,
    open:     mockReports.filter(r => r.status === 'open').length,
    analysis: mockReports.filter(r => r.status === 'analysis').length,
    resolved: mockReports.filter(r => r.status === 'resolved').length,
  };

  const statCards: Array<{
    label: string;
    value: number;
    gradient: string;
    shadow: string;
    filter: typeof selectedStatus;
  }> = [
    { label: 'Total',      value: stats.total,    gradient: 'from-primary to-blue-600',      shadow: 'shadow-primary/20',   filter: 'all'      },
    { label: 'Abertos',    value: stats.open,      gradient: 'from-amber-500 to-orange-500',  shadow: 'shadow-amber-500/20', filter: 'open'     },
    { label: 'Em análise', value: stats.analysis,  gradient: 'from-blue-500 to-indigo-500',   shadow: 'shadow-blue-500/20',  filter: 'analysis' },
    { label: 'Resolvidos', value: stats.resolved,  gradient: 'from-green-500 to-emerald-500', shadow: 'shadow-green-500/20', filter: 'resolved' },
  ];

  // ── Side-effects ───────────────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node))
        setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (currentView === 'calls') {
      setIsLoadingTable(true);
      const t = setTimeout(() => setIsLoadingTable(false), 800);
      return () => clearTimeout(t);
    }
  }, [selectedStatus, selectedCategory, search, currentView]);

  // ── Modal handlers ─────────────────────────────────────────────────────────
  const handleRowClick = (report: Report) => {
    setSelectedReport(report);
    setImagePreview(null);
    setObservation('');
    setIsFinalized(false);
    setResolveModalOpen(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open && imagePreview) URL.revokeObjectURL(imagePreview);
    setResolveModalOpen(open);
    if (!open) setImagePreview(null);
  };

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  };

  const handleFinalize = () => {
    setIsFinalized(true);
    setTimeout(() => {
      handleModalOpenChange(false);
      setIsFinalized(false);
    }, 1600);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex bg-gray-50 overflow-hidden">

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className={`
        relative bg-white border-r border-border flex flex-col transition-all duration-300
        fixed inset-y-0 left-0 z-40 w-56
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:inset-auto md:z-auto md:translate-x-0
        ${sidebarOpen ? 'md:w-56' : 'md:w-14'}
      `}>

        {/* Botão flutuante de toggle — desktop only */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          className="hidden md:flex absolute -right-3 top-6 z-20 w-6 h-6 bg-white border border-border rounded-full items-center justify-center shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
        >
          {sidebarOpen
            ? <MdChevronLeft  className="w-3.5 h-3.5 text-gray-500" />
            : <MdChevronRight className="w-3.5 h-3.5 text-gray-500" />
          }
        </button>

        {/* Header */}
        <div className="px-3 py-4 border-b border-border flex items-center min-h-[64px]">
          <div className={`flex items-center gap-2.5 min-w-0 flex-1 ${!sidebarOpen ? 'md:justify-center' : ''}`}>
            <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-2 shadow-md shadow-primary/30 flex-shrink-0">
              <MdLocationOn className="w-5 h-5 text-white" />
            </div>
            {/* Label — some only when expanded */}
            <div className={`overflow-hidden transition-all duration-200 whitespace-nowrap ${sidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'}`}>
              <h1 className="font-bold text-sm">Painel</h1>
              <p className="text-[11px] text-muted-foreground">Municipal</p>
            </div>
          </div>
          {/* X — mobile only */}
          <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
            <MdClose className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="p-2 space-y-0.5 flex-1">
          {[
            { icon: MdMenu,       label: 'Chamados',   view: 'calls'   as AdminView },
            { icon: MdLocationOn, label: 'Mapa',       view: 'map'     as AdminView },
            { icon: MdBarChart,   label: 'Relatórios', view: 'reports' as AdminView },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => { setCurrentView(item.view); if (window.innerWidth < 768) setSidebarOpen(false); }}
              className={`w-full flex items-center rounded-lg text-sm transition-all font-semibold py-2.5
                ${sidebarOpen ? 'gap-3 px-3' : 'justify-center px-2'}
                ${currentView === item.view
                  ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-md shadow-primary/30'
                  : 'text-foreground hover:bg-gray-100'
                }
              `}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${sidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-border">
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`w-full flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors ${sidebarOpen ? 'gap-2' : 'justify-center'}`}
              title={!sidebarOpen ? 'Equipe Municipal' : undefined}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <MdPerson className="w-4 h-4 text-white" />
              </div>
              <div className={`min-w-0 text-left overflow-hidden transition-all duration-200 ${sidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'}`}>
                <p className="text-xs font-semibold truncate whitespace-nowrap">Equipe Municipal</p>
                <p className="text-[10px] text-muted-foreground truncate whitespace-nowrap">admin@sp.gov.br</p>
              </div>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
                >
                  <div className="p-1">
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

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentView !== 'reports' && (
          <header className="bg-white border-b border-border">
            <div className="px-4 py-3 flex items-center gap-3 min-w-0">
              {/* Abre o overlay só no mobile */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <MdMenu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="min-w-0">
                <h2 className="font-bold truncate text-gray-900">
                  {currentView === 'map' ? 'Mapa de Ocorrências' : 'Fila de Chamados'}
                </h2>
                <p className="text-gray-500 text-xs truncate">
                  {currentView === 'map' ? 'Visualização geográfica' : `${filteredReports.length} chamado(s)`}
                </p>
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

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {statCards.map((stat, i) => {
                const isActive = selectedStatus === stat.filter;
                return (
                  <motion.button
                    key={stat.label}
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedStatus(stat.filter)}
                    className={`bg-gradient-to-br ${stat.gradient} text-white rounded-xl p-3 shadow-lg ${stat.shadow} text-left transition-all ${
                      isActive ? 'ring-2 ring-white/60 scale-[1.03]' : 'hover:scale-[1.02] opacity-90 hover:opacity-100'
                    }`}
                  >
                    <p className="text-xs text-white/80 font-medium">{stat.label}</p>
                    <div className="flex items-end justify-between mt-1">
                      <p className="font-bold">{stat.value}</p>
                      {isActive
                        ? <span className="text-[10px] bg-white/30 px-1.5 py-0.5 rounded-full font-semibold">Ativo</span>
                        : <MdTrendingUp className="w-4 h-4 text-white/60" />
                      }
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Filters */}
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
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as typeof selectedStatus)}
                  className="px-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="all">Todos os status</option>
                  <option value="open">Abertos</option>
                  <option value="analysis">Em Análise</option>
                  <option value="resolved">Resolvidos</option>
                </select>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as typeof selectedCategory)}
                  className="px-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="all">Todas categorias</option>
                  <option value="buraco">Buraco</option>
                  <option value="lixo">Lixo</option>
                  <option value="iluminacao">Iluminação</option>
                  <option value="calcada">Calçada</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
            </div>

            {/* Table */}
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
                        const Icon   = categoryConfig[report.category].icon;
                        const config = categoryConfig[report.category];
                        return (
                          <tr
                            key={report.id}
                            onClick={() => handleRowClick(report)}
                            className="border-t border-border hover:bg-blue-50/50 transition-colors cursor-pointer group"
                          >
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
                            <td className="px-4 py-2.5">
                              <Badge status={report.status}>{statusLabels[report.status]}</Badge>
                            </td>
                            <td className="px-4 py-2.5">
                              {/* Stop row-click from firing when interacting with this select */}
                              <select
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => e.stopPropagation()}
                                className="px-2 py-1 text-xs rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                              >
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


      {/* ── Finalize-report modal ─────────────────────────────────────────────── */}
      {selectedReport && (
        <Modal
          open={resolveModalOpen}
          onOpenChange={handleModalOpenChange}
          title={`Finalizar Chamado #${selectedReport.id}`}
          subtitle={selectedReport.address}
        >
          <div className="space-y-4">

            {/* Report summary card */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {(() => {
                  const Icon   = categoryConfig[selectedReport.category].icon;
                  const config = categoryConfig[selectedReport.category];
                  return (
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${config.gradient}`}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                  );
                })()}
                <span className="text-sm font-semibold capitalize text-gray-800">
                  {selectedReport.category}
                </span>
                <Badge status={selectedReport.status}>
                  {statusLabels[selectedReport.status]}
                </Badge>
              </div>
              <p className="text-sm text-gray-700">{selectedReport.address}</p>
              <p className="text-xs text-gray-400 mt-1">
                {selectedReport.neighborhood} · {selectedReport.date}
              </p>
            </div>

            {/* Image upload */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Comprovante de resolução
                <span className="ml-1 text-gray-400 font-normal">(opcional)</span>
              </p>

              {imagePreview ? (
                /* Preview */
                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Comprovante"
                    className="w-full object-cover max-h-52"
                  />
                  <button
                    onClick={() => {
                      URL.revokeObjectURL(imagePreview);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                    aria-label="Remover imagem"
                  >
                    <MdClose className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2">
                    <p className="text-xs text-white font-medium">Imagem selecionada</p>
                  </div>
                </div>
              ) : (
                /* Drop zone */
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-primary bg-primary/5 scale-[1.01]'
                      : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                  }`}
                >
                  <MdCloudUpload className={`w-9 h-9 mx-auto mb-2 transition-colors ${isDragging ? 'text-primary' : 'text-gray-300'}`} />
                  <p className="text-sm font-medium text-gray-600">Arraste ou clique para enviar</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, HEIC — máx. 10 MB</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageSelect(file);
                  e.target.value = '';
                }}
              />
            </div>

            {/* Observation */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Observação
                <span className="ml-1 text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Descreva o que foi feito para resolver o chamado..."
                rows={3}
                className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => handleModalOpenChange(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleFinalize}
                disabled={isFinalized}
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-80 flex items-center justify-center gap-2"
              >
                {isFinalized ? (
                  <>
                    <MdCheckCircle className="w-4 h-4" />
                    Finalizado!
                  </>
                ) : (
                  'Finalizar Chamado'
                )}
              </button>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
}
