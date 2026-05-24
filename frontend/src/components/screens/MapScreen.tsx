import { useRef, useState } from 'react';
import { MdSearch, MdAdd, MdList, MdPerson, MdFilterList, MdCamera, MdLocationOn, MdClose, MdMyLocation } from 'react-icons/md';
import { NotificationBell } from '../NotificationBell';
import { CategoryType, CategoryChip } from '../CategoryChip';
import { LeafletMap, MapMarker } from '../LeafletMap';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { Textarea } from '../Textarea';
import { motion } from 'motion/react';

// ── Cores dos marcadores (matches theme.css) ──────────────────────────────────
const CATEGORY_COLORS: Record<CategoryType, string> = {
  buraco:     '#EF4444',
  lixo:       '#F59E0B',
  iluminacao: '#3B82F6',
  calcada:    '#F97316',
  outros:     '#6B7280',
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const mockReports: Array<{ id: string; category: CategoryType; address: string; lat: number; lng: number }> = [
  { id: '1', category: 'buraco',     address: 'Av. Paulista, 1578 — Bela Vista',   lat: -23.5616, lng: -46.6564 },
  { id: '2', category: 'lixo',       address: 'Rua Augusta, 2450 — Consolação',    lat: -23.5530, lng: -46.6500 },
  { id: '3', category: 'iluminacao', address: 'Rua da Consolação, 3456',           lat: -23.5562, lng: -46.6490 },
];

const categories: CategoryType[] = ['buraco', 'lixo', 'iluminacao', 'calcada', 'outros'];

// ── Props ─────────────────────────────────────────────────────────────────────
interface MapScreenProps {
  onNewReport: () => void;
  onMyReports: () => void;
  onProfile: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function MapScreen({ onMyReports, onProfile }: MapScreenProps) {
  const [searchQuery, setSearchQuery]           = useState('');
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [description, setDescription]           = useState('');
  const [image, setImage]                       = useState<string | null>(null);
  const [submitted, setSubmitted]               = useState(false);
  const mapContainerRef = useRef<HTMLElement & { _leafletLocate?: () => void } | null>(null);

  const filteredReports = mockReports.filter(r =>
    !searchQuery || r.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const markers: MapMarker[] = filteredReports.map(r => ({
    id: r.id,
    lat: r.lat,
    lng: r.lng,
    color: CATEGORY_COLORS[r.category],
    popupHtml: `
      <div style="font-family:sans-serif;font-size:13px;line-height:1.4">
        <strong style="color:#1e293b">#${r.id} — ${r.category}</strong><br/>
        <span style="color:#64748b">${r.address}</span>
      </div>`,
  }));

  const handleLocate = () => {
    (mapContainerRef.current as any)?._leafletLocate?.();
  };

  const handleImageUpload = () => {
    setImage('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400');
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setShowNewReportModal(false);
      setSubmitted(false);
      setSelectedCategory(null);
      setDescription('');
      setImage(null);
    }, 2000);
  };

  return (
    <>
      <div className="h-full flex flex-col bg-background">

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-600 text-white">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold">Denúncias Urbanas</h1>
                <p className="text-white/80 text-xs">São Paulo, SP</p>
              </div>
              <div className="flex gap-2">
                <button onClick={onMyReports} className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                  <MdList className="w-5 h-5" />
                </button>
                <NotificationBell />
                <button onClick={onProfile} className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                  <MdPerson className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

          {/* Painel lateral */}
          <div className="md:w-80 md:border-r border-border bg-white order-2 md:order-1 flex flex-col overflow-hidden max-h-48 md:max-h-none">
            <div className="bg-white px-4 pt-3 pb-3 border-b border-border space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">Ocorrências Próximas</h3>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <MdFilterList className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por localização..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredReports.map((report, i) => (
                <motion.div
                  key={report.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md cursor-pointer transition-all border border-gray-100"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 shadow"
                    style={{ background: CATEGORY_COLORS[report.category] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{report.address}</p>
                    <p className="text-xs text-gray-500 capitalize">{report.category}</p>
                  </div>
                  <span className="text-[11px] text-gray-400">2h</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mapa */}
          <div className="flex-1 relative order-1 md:order-2 min-h-[40vh] md:min-h-0">
            <LeafletMap
              center={[-23.5505, -46.6333]}
              zoom={14}
              markers={markers}
              className="absolute inset-0"
            />

            {/* Botão localizar */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[400]">
              <button
                onClick={handleLocate}
                className="p-3 bg-gradient-to-br from-primary to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                title="Minha localização"
              >
                <MdMyLocation className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* FAB nova denúncia */}
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, rotate: 90, transition: { type: 'spring', stiffness: 400 } }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
          onClick={() => setShowNewReportModal(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-2xl hover:shadow-green-500/50 flex items-center justify-center z-[500]"
        >
          <MdAdd className="w-7 h-7" />
        </motion.button>
      </div>

      {/* Modal nova denúncia */}
      <Modal
        open={showNewReportModal}
        onOpenChange={setShowNewReportModal}
        title="Nova Denúncia"
        subtitle="Registre um problema urbano"
      >
        {submitted ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
              <motion.svg
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </motion.svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Denúncia Enviada!</h3>
            <p className="text-gray-600">Você pode acompanhar o status em "Minhas Denúncias"</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block font-semibold mb-3 text-gray-900">Foto do problema</label>
              <div
                onClick={handleImageUpload}
                className="border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden cursor-pointer hover:border-primary transition-colors group"
              >
                {image ? (
                  <div className="relative">
                    <img src={image} alt="Upload" className="w-full h-56 object-cover" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setImage(null); }}
                      className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                    >
                      <MdClose className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="h-56 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-primary/5 group-hover:to-primary/10 transition-colors">
                    <div className="p-4 bg-white rounded-2xl shadow-md group-hover:shadow-lg transition-shadow">
                      <MdCamera className="w-10 h-10 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="font-medium text-gray-600 group-hover:text-primary transition-colors">Adicionar foto</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-3 text-gray-900">Categoria</label>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => (
                  <CategoryChip
                    key={category}
                    category={category}
                    selected={selectedCategory === category}
                    onClick={() => setSelectedCategory(category)}
                  />
                ))}
              </div>
            </div>

            <Textarea
              label="Descrição (opcional)"
              placeholder="Descreva o problema com mais detalhes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 flex items-start gap-3 border border-blue-100">
              <MdLocationOn className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Localização detectada</p>
                <p className="text-sm text-gray-600 mt-1">Av. Paulista, 1578 — Bela Vista, São Paulo</p>
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={handleSubmit} disabled={!selectedCategory || !image}>
              Enviar Denúncia
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
