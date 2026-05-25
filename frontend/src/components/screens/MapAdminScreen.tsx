import { useState, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  MdLocationOn, MdSearch, MdZoomIn, MdZoomOut,
  MdMyLocation, MdClose, MdTune,
} from 'react-icons/md';
import { CategoryType, categoryConfig } from '../CategoryChip';
import { Badge } from '../Badge';
import { ReportOccurrenceDetail } from '../ReportOccurrenceDetail';
import { ExportButton } from '../ExportButton';
import { LeafletMap, MapMarker, type LeafletMapApi } from '../LeafletMap';
import { motion, AnimatePresence } from 'motion/react';
import { useDenuncias } from '../../hooks/api/useDenuncias';
import { useDenunciasLiveSync } from '../../hooks/useDenunciasLiveSync';
import type { Complaint } from '../../types';

const CATEGORY_COLORS: Record<CategoryType, string> = {
  buraco:     '#EF4444',
  lixo:       '#F59E0B',
  iluminacao: '#3B82F6',
  calcada:    '#F97316',
  vandalismo: '#8B5CF6',
  outros:     '#6B7280',
};

const statusLabels = { open: 'Aberto', analysis: 'Em Análise', resolved: 'Resolvido' };

const SHEET_BOTTOM = 'env(safe-area-inset-bottom, 0px)';

function AdminMobilePortal({ children }: { children: ReactNode }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}

export function MapAdminScreen() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [selectedStatus, setSelectedStatus]     = useState<'all' | 'open' | 'analysis' | 'resolved'>('all');
  const [search, setSearch]                     = useState('');
  const [panelOpen, setPanelOpen]               = useState(false);
  const [filtersOpen, setFiltersOpen]           = useState(false);
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

  const activeReport = activeId ? filteredReports.find(r => r.id === activeId) : null;

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

  const selectReport = (report: Complaint) => {
    setActiveId(report.id);
    setPanelOpen(true);
    if (report.lat != null && report.lng != null) {
      mapApiRef.current?.flyTo(report.lat, report.lng, 16);
    }
  };

  const handleMarkerClick = (id: string) => {
    const report = filteredReports.find(r => r.id === id);
    if (report) selectReport(report);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setActiveId(null);
  };

  const FiltersForm = ({ className = '' }: { className?: string }) => (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por endereço..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as typeof selectedCategory)}
          className="px-3 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-200"
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
          className="px-3 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-200"
        >
          <option value="all">Todos status</option>
          <option value="open">Abertos</option>
          <option value="analysis">Em análise</option>
          <option value="resolved">Resolvidos</option>
        </select>
      </div>
      <div className="hidden md:block">
        <ExportButton variant="secondary" size="sm" onExport={(format) => console.log(`Exportando mapa em ${format}`)} />
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

      {/* Filtros — desktop */}
      <div className="hidden md:block bg-white border-b border-border p-4 flex-shrink-0">
        <div className="flex flex-row gap-3 items-center">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por endereço..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as typeof selectedCategory)}
            className="px-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-200"
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
            className="px-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-200"
          >
            <option value="all">Todos os status</option>
            <option value="open">Abertos</option>
            <option value="analysis">Em Análise</option>
            <option value="resolved">Resolvidos</option>
          </select>
          <ExportButton variant="secondary" size="sm" onExport={(format) => console.log(`Exportando mapa em ${format}`)} />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative min-h-0">

        {/* Painel lateral — desktop */}
        <div className="hidden md:flex w-80 bg-white border-r border-border flex-col overflow-hidden flex-shrink-0">
          <div className="p-3 border-b border-border">
            <h3 className="font-bold text-sm text-gray-900">
              {isLoading ? 'Carregando...' : `${filteredReports.length} Ocorrências`}
            </h3>
          </div>
          <ReportList
            reports={filteredReports}
            isLoading={isLoading}
            activeId={activeId}
            onSelect={selectReport}
          />
        </div>

        {/* Mapa */}
        <div className="flex-1 relative min-h-0">
          <LeafletMap
            center={[-10.1840, -48.3336]}
            zoom={14}
            markers={markers}
            onMarkerClick={handleMarkerClick}
            onMapReady={(api) => { mapApiRef.current = api; }}
            className="absolute inset-0"
          />

          <div className="absolute top-3 left-14 right-3 max-md:top-[calc(3.5rem+env(safe-area-inset-top,0px))] md:left-1/2 md:right-auto md:-translate-x-1/2 md:max-w-sm flex gap-2 z-[400] pointer-events-none">
            <div className="flex-1 md:flex-none bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-gray-200 pointer-events-auto min-w-0">
              <div className="flex items-center gap-2">
                <MdLocationOn className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-xs font-semibold text-gray-900 truncate">Palmas, TO</p>
                <span className="text-xs text-gray-400 flex-shrink-0">· {filteredReports.length}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="md:hidden p-2.5 bg-white rounded-xl shadow-lg border border-gray-200 pointer-events-auto flex-shrink-0"
              aria-label="Filtros"
            >
              <MdTune className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          <div className="absolute right-3 max-md:bottom-24 md:bottom-4 flex flex-col gap-2 z-[400]">
            <button
              onClick={() => mapApiRef.current?.flyTo(-10.1840, -48.3336, 14)}
              className="p-3 bg-white rounded-xl shadow-lg border border-gray-200"
            >
              <MdZoomIn className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => mapApiRef.current?.flyTo(-10.1840, -48.3336, 12)}
              className="p-3 bg-white rounded-xl shadow-lg border border-gray-200"
            >
              <MdZoomOut className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => mapApiRef.current?.locate()}
              className="p-3 bg-gradient-to-br from-primary to-blue-600 text-white rounded-xl shadow-lg"
            >
              <MdMyLocation className="w-5 h-5" />
            </button>
          </div>

          {/* Peek lista — mobile */}
          {!panelOpen && (
            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="md:hidden absolute bottom-3 left-3 right-3 z-[400] flex items-center justify-between gap-2 px-4 py-3.5 bg-white rounded-2xl shadow-lg border border-gray-100"
            >
              <span className="font-bold text-sm text-gray-900">Ocorrências no mapa</span>
              <span className="text-xs font-semibold text-primary">
                {isLoading ? '...' : `${filteredReports.length} · Ver lista`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Sheet lista / detalhe — mobile (portal: cobre a topbar) */}
      <AnimatePresence>
        {panelOpen && (
          <AdminMobilePortal>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-[800] bg-black/40"
              onClick={closePanel}
            />
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              style={{ bottom: SHEET_BOTTOM }}
              className="md:hidden fixed left-0 right-0 z-[810] flex flex-col bg-white rounded-t-2xl shadow-2xl max-h-[50dvh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>
              <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
                <h3 className="font-bold text-sm">
                  {activeReport ? 'Detalhe' : `${filteredReports.length} ocorrências`}
                </h3>
                <button type="button" onClick={closePanel} className="p-2 rounded-lg hover:bg-gray-100">
                  <MdClose className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto min-h-0">
                {activeReport ? (
                  <div className="p-4 space-y-3">
                    <button
                      type="button"
                      onClick={() => setActiveId(null)}
                      className="text-xs text-primary font-semibold"
                    >
                      ← Voltar à lista
                    </button>
                    <ReportOccurrenceDetail report={activeReport} />
                  </div>
                ) : (
                  <ReportList
                    reports={filteredReports}
                    isLoading={isLoading}
                    activeId={activeId}
                    onSelect={selectReport}
                    className="p-3"
                  />
                )}
              </div>
            </motion.div>
          </AdminMobilePortal>
        )}
      </AnimatePresence>

      {/* Sheet filtros — mobile */}
      <AnimatePresence>
        {filtersOpen && (
          <AdminMobilePortal>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-[800] bg-black/40"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              style={{ bottom: SHEET_BOTTOM }}
              className="md:hidden fixed left-0 right-0 z-[810] flex flex-col bg-white rounded-t-2xl p-4 shadow-2xl max-h-[40dvh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm">Filtros</h3>
                <button type="button" onClick={() => setFiltersOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                  <MdClose className="w-5 h-5" />
                </button>
              </div>
              <FiltersForm />
            </motion.div>
          </AdminMobilePortal>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReportList({
  reports,
  isLoading,
  activeId,
  onSelect,
  className = 'p-3',
}: {
  reports:    Complaint[];
  isLoading:  boolean;
  activeId:   string | null;
  onSelect:   (r: Complaint) => void;
  className?: string;
}) {
  if (isLoading) {
    return (
      <div className={`flex justify-center py-10 ${className}`}>
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {reports.map((report, i) => {
        const Icon   = categoryConfig[report.category].icon;
        const config = categoryConfig[report.category];
        const isActive = activeId === report.id;
        return (
          <motion.div
            key={report.id}
            initial={{ x: -12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onSelect(report)}
            className={`border rounded-xl p-3 cursor-pointer transition-all ${
              isActive ? 'border-primary ring-2 ring-primary/20 bg-blue-50/30' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient} flex-shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <Badge status={report.status} className="mb-1">
                  {statusLabels[report.status]}
                </Badge>
                <p className="text-sm font-semibold text-gray-900 line-clamp-2">{report.address}</p>
                <p className="text-xs text-gray-500 capitalize">{report.category}</p>
                <p className="text-[11px] text-gray-400 mt-1">{report.date}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
      {reports.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">Nenhuma ocorrência no mapa</p>
      )}
    </div>
  );
}
