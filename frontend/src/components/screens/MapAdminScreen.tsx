import { useState, useRef } from 'react';
import { MdLocationOn, MdFilterList, MdSearch, MdZoomIn, MdZoomOut, MdMyLocation, MdClose } from 'react-icons/md';
import { CategoryType, categoryConfig } from '../CategoryChip';
import { Badge } from '../Badge';
import { ExportButton } from '../ExportButton';
import { LeafletMap, MapMarker, type LeafletMapApi } from '../LeafletMap';
import { motion, AnimatePresence } from 'motion/react';
import { useDenuncias } from '../../hooks/api/useDenuncias';
import { useDenunciasLiveSync } from '../../hooks/useDenunciasLiveSync';

// ── Cores por categoria ────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<CategoryType, string> = {
  buraco:     '#EF4444',
  lixo:       '#F59E0B',
  iluminacao: '#3B82F6',
  calcada:    '#F97316',
  vandalismo: '#8B5CF6',
  outros:     '#6B7280',
};

const statusLabels = { open: 'Aberto', analysis: 'Em Análise', resolved: 'Resolvido' };

// ── Component ─────────────────────────────────────────────────────────────────
export function MapAdminScreen() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [selectedStatus, setSelectedStatus]     = useState<'all' | 'open' | 'analysis' | 'resolved'>('all');
  const [search, setSearch]                     = useState('');
  const [panelOpen, setPanelOpen]               = useState(false);
  const [activeId, setActiveId]                 = useState<string | null>(null);
  const mapApiRef = useRef<LeafletMapApi | null>(null);

  const { complaints, isLoading } = useDenuncias();
  useDenunciasLiveSync();

  const filteredReports = complaints.filter(report => {
    if (report.lat === undefined || report.lng === undefined) return false;
    const categoryMatch = selectedCategory === 'all' || report.category === selectedCategory;
    const statusMatch   = selectedStatus   === 'all' || report.status   === selectedStatus;
    const searchMatch   = !search || report.address.toLowerCase().includes(search.toLowerCase());
    return categoryMatch && statusMatch && searchMatch;
  });

  const markers: MapMarker[] = filteredReports.map(r => ({
    id:    r.id,
    lat:   r.lat!,
    lng:   r.lng!,
    color: CATEGORY_COLORS[r.category],
    popupHtml: `
      <div style="font-family:sans-serif;font-size:13px;line-height:1.6;min-width:160px">
        <strong style="color:#1e293b">${r.category}</strong><br/>
        <span style="color:#475569">${r.address}</span><br/>
        <span style="color:#94a3b8;font-size:11px">${r.date}</span>
      </div>`,
  }));

  const handleMarkerClick = (id: string) => {
    setActiveId(id);
    const report = filteredReports.find(r => r.id === id);
    if (report?.lat && report?.lng) {
      mapApiRef.current?.flyTo(report.lat, report.lng, 16);
    }
  };

  const handleLocate = () => {
    mapApiRef.current?.locate();
  };

  return (
    <div className="h-full flex flex-col">

      {/* Filtros */}
      <div className="bg-white border-b border-border p-4">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
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
          <ExportButton variant="secondary" size="sm" onExport={(format) => console.log(`Exportando mapa em ${format}`)} />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Overlay mobile */}
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              key="panel-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setPanelOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Painel de ocorrências */}
        <div className={`
          fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-border flex flex-col overflow-hidden
          transition-transform duration-300
          md:relative md:translate-x-0 md:z-auto md:flex
          ${panelOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">
              {isLoading ? 'Carregando...' : `${filteredReports.length} Ocorrências`}
            </h3>
            <button onClick={() => setPanelOpen(false)} className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <MdClose className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredReports.map((report, i) => {
              const Icon   = categoryConfig[report.category].icon;
              const config = categoryConfig[report.category];
              const isActive = activeId === report.id;
              return (
                <motion.div
                  key={report.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleMarkerClick(report.id)}
                  className={`bg-white border rounded-xl p-3 cursor-pointer transition-all hover:shadow-md ${
                    isActive ? 'border-primary shadow-md ring-2 ring-primary/20' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient} flex-shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Badge status={report.status} className="!w-auto !px-2 text-[10px]">
                          {statusLabels[report.status]}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{report.address}</p>
                      <p className="text-xs text-gray-500 capitalize">{report.category}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{report.date}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Mapa real */}
        <div className="flex-1 relative">
          <LeafletMap
            center={[-10.1840, -48.3336]}
            zoom={14}
            markers={markers}
            onMarkerClick={handleMarkerClick}
            onMapReady={(api) => { mapApiRef.current = api; }}
            className="absolute inset-0"
          />

          {/* Controles do mapa */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[400]">
            <button
              onClick={() => mapApiRef.current?.flyTo(-10.1840, -48.3336, 14)}
              className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200"
              title="Zoom in"
            >
              <MdZoomIn className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => mapApiRef.current?.flyTo(-10.1840, -48.3336, 12)}
              className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200"
              title="Zoom out"
            >
              <MdZoomOut className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={handleLocate}
              className="p-3 bg-gradient-to-br from-primary to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
              title="Minha localização"
            >
              <MdMyLocation className="w-5 h-5" />
            </button>
          </div>

          {/* Botão lista — mobile */}
          <button
            onClick={() => setPanelOpen(true)}
            className="md:hidden absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-lg border border-gray-200 text-sm font-semibold text-gray-700 z-[400]"
          >
            <MdFilterList className="w-4 h-4" />
            Lista ({filteredReports.length})
          </button>

          {/* Badge de cidade */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-gray-200 z-[400] pointer-events-none">
            <div className="flex items-center gap-2">
              <MdLocationOn className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold text-gray-900">Palmas, TO</p>
              <span className="text-xs text-gray-400">· {filteredReports.length} ocorrências</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
