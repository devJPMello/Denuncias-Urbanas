import { useRef, useState } from 'react';
import { MdSearch, MdAdd, MdList, MdPerson, MdFilterList, MdCamera, MdLocationOn, MdClose, MdMyLocation, MdPhoto, MdRefresh, MdGpsFixed } from 'react-icons/md';
import { NotificationBell } from '../NotificationBell';
import { CategoryType, CategoryChip } from '../CategoryChip';
import { LeafletMap, MapMarker } from '../LeafletMap';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { Textarea } from '../Textarea';
import { motion } from 'motion/react';
import { useDenuncias } from '../../hooks/api/useDenuncias';
import { useCreateDenuncia } from '../../hooks/api/useCreateDenuncia';
import { useAuth } from '@clerk/clerk-react';
import { CLERK_ENABLED } from '../../lib/auth';

// ── Cores dos marcadores (matches theme.css) ──────────────────────────────────
const CATEGORY_COLORS: Record<CategoryType, string> = {
  buraco:     '#EF4444',
  lixo:       '#F59E0B',
  iluminacao: '#3B82F6',
  calcada:    '#F97316',
  vandalismo: '#8B5CF6',
  outros:     '#6B7280',
};

const categories: CategoryType[] = ['buraco', 'lixo', 'iluminacao', 'calcada', 'vandalismo', 'outros'];

// ── Props ─────────────────────────────────────────────────────────────────────
interface MapScreenProps {
  onNewReport: () => void;
  onMyReports: () => void;
  onProfile: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function MapScreen({ onMyReports, onProfile }: MapScreenProps) {
  const [searchQuery, setSearchQuery]               = useState('');
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [selectedCategory, setSelectedCategory]     = useState<CategoryType | null>(null);
  const [description, setDescription]               = useState('');

  // Imagem: File para upload real + preview local
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading,  setIsUploading]  = useState(false);

  const [submitted, setSubmitted] = useState(false);

  // ── Geolocalização ───────────────────────────────────────────────────────────
  const [locAddress,  setLocAddress]  = useState<string | null>(null);
  const [locCoords,   setLocCoords]   = useState<{ lat: number; lng: number } | null>(null);
  const [locAccuracy, setLocAccuracy] = useState<number | null>(null);
  const [locLoading,  setLocLoading]  = useState(false);
  const [locError,    setLocError]    = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLElement & { _leafletLocate?: () => void } | null>(null);
  const fileInputRef    = useRef<HTMLInputElement>(null);   // galeria / pasta
  const cameraInputRef  = useRef<HTMLInputElement>(null);   // câmera

  const { complaints, isLoading } = useDenuncias();
  const { create, isLoading: isCreating } = useCreateDenuncia();
  const { getToken } = useAuth();

  const filteredReports = complaints.filter(r =>
    !searchQuery || r.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const markers: MapMarker[] = filteredReports
    .filter(r => r.lat !== undefined && r.lng !== undefined)
    .map(r => ({
      id: r.id,
      lat: r.lat!,
      lng: r.lng!,
      color: CATEGORY_COLORS[r.category],
      popupHtml: `
        <div style="font-family:sans-serif;font-size:13px;line-height:1.4">
          <strong style="color:#1e293b">${r.title ?? r.category}</strong><br/>
          <span style="color:#64748b">${r.address}</span>
        </div>`,
    }));

  const handleLocate = () => {
    (mapContainerRef.current as any)?._leafletLocate?.();
  };

  // Converte lat/lng em endereço legível via Nominatim
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=pt-BR`,
      );
      const data = await res.json();
      return data.display_name as string;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  };

  const applyPosition = async (coords: GeolocationCoordinates) => {
    const { latitude: lat, longitude: lng, accuracy } = coords;
    setLocCoords({ lat, lng });
    setLocAccuracy(Math.round(accuracy));
    const addr = await reverseGeocode(lat, lng);
    setLocAddress(addr);
    setLocLoading(false);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocalização não suportada neste dispositivo.');
      return;
    }
    setLocLoading(true);
    setLocError(null);

    // 1ª tentativa: alta precisão (GPS) — ideal para celular ao ar livre
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => applyPosition(coords),
      () => {
        // 2ª tentativa: baixa precisão (WiFi/IP) — funciona em desktop e indoor
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => applyPosition(coords),
          (err) => {
            setLocLoading(false);
            if (err.code === 1) {
              setLocError('Permissão negada. Libere a localização nas configurações do navegador.');
            } else {
              setLocError('Não foi possível detectar sua localização. Digite o endereço manualmente.');
            }
          },
          { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
        );
      },
      { enableHighAccuracy: true, timeout: 8_000, maximumAge: 0 },
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Revogar URL anterior se existir
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  /** Faz upload do arquivo e retorna a URL do servidor. */
  const uploadImage = async (file: File): Promise<string | undefined> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = CLERK_ENABLED ? await getToken() : null;
      const headers: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) throw new Error(`Upload falhou: HTTP ${res.status}`);
      const { url } = await res.json() as { url: string };
      return url;
    } catch (err) {
      console.error('Erro no upload:', err);
      return undefined;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategory) return;

    try {
      // Faz upload da imagem antes de criar a denúncia
      let imagemUrl: string | undefined;
      if (imageFile) {
        imagemUrl = await uploadImage(imageFile);
      }

      await create({
        titulo:    `${selectedCategory} — denúncia`,
        descricao: description || 'Sem descrição',
        categoria: selectedCategory as any,
        endereco:  locAddress ?? 'Endereço não informado',
        imagemUrl,
        lat:       locCoords?.lat,
        lng:       locCoords?.lng,
      });

      setSubmitted(true);
      setTimeout(() => {
        setShowNewReportModal(false);
        setSubmitted(false);
        setSelectedCategory(null);
        setDescription('');
        removeImage();
        setLocAddress(null);
        setLocCoords(null);
        setLocAccuracy(null);
        setLocError(null);
      }, 2000);
    } catch {
      // erro tratado pelo hook (TanStack Query)
    }
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
                <p className="text-white/80 text-xs">Palmas, TO</p>
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
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredReports.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">Nenhuma ocorrência encontrada</p>
              ) : (
                filteredReports.map((report, i) => (
                  <motion.div
                    key={report.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
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
                    <span className="text-[11px] text-gray-400">{report.date}</span>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Mapa */}
          <div className="flex-1 relative order-1 md:order-2 min-h-[40vh] md:min-h-0">
            <LeafletMap
              center={[-10.1840, -48.3336]}
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
            {/* Foto */}
            <div>
              <label className="block font-semibold mb-3 text-gray-900">Foto do problema</label>
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
              <input ref={fileInputRef}   type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

              {imagePreview ? (
                <div className="relative border-2 border-gray-200 rounded-2xl overflow-hidden">
                  <img src={imagePreview} alt="Upload" className="w-full h-56 object-cover" />
                  <button
                    onClick={removeImage}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    <MdClose className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 h-32 border-2 border-dashed border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:border-primary hover:from-primary/5 hover:to-primary/10 transition-all group"
                  >
                    <div className="p-3 bg-white rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                      <MdCamera className="w-7 h-7 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-xs font-medium text-gray-600 group-hover:text-primary transition-colors">Câmera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 h-32 border-2 border-dashed border-gray-300 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:border-primary hover:from-primary/5 hover:to-primary/10 transition-all group"
                  >
                    <div className="p-3 bg-white rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                      <MdPhoto className="w-7 h-7 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-xs font-medium text-gray-600 group-hover:text-primary transition-colors">Galeria / Pasta</span>
                  </button>
                </div>
              )}
            </div>

            {/* Categoria */}
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

            {/* Localização */}
            {locCoords ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-3 border border-blue-100">
                <div className="flex items-start gap-3">
                  <MdGpsFixed className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">Localização</p>
                      {locAccuracy !== null && (() => {
                        const good = locAccuracy <= 20;
                        const ok   = locAccuracy <= 100;
                        return (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            good ? 'bg-green-100 text-green-700'
                                 : ok ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-red-100 text-red-600'
                          }`}>
                            {good ? '✓ Alta precisão' : ok ? '⚠ Precisão média' : '✗ Baixa precisão'} · ~{locAccuracy}m
                          </span>
                        );
                      })()}
                    </div>
                    <input
                      type="text"
                      value={locAddress ?? ''}
                      onChange={(e) => setLocAddress(e.target.value)}
                      placeholder="Digite o endereço do problema..."
                      className="w-full text-xs text-gray-800 bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Edite se o endereço estiver incorreto</p>
                  </div>
                  <button onClick={detectLocation} title="Atualizar localização" className="p-1.5 hover:bg-blue-200 rounded-lg transition-colors flex-shrink-0">
                    <MdRefresh className="w-4 h-4 text-primary" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locLoading}
                  className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-60"
                >
                  {locLoading ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  ) : (
                    <MdLocationOn className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  )}
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-700">
                      {locLoading ? 'Obtendo localização...' : 'Usar minha localização atual'}
                    </p>
                    {!locLoading && !locError && (
                      <p className="text-xs text-gray-400 mt-0.5">Toque para detectar automaticamente</p>
                    )}
                    {locError && <p className="text-xs text-red-500 mt-0.5">{locError}</p>}
                  </div>
                </button>

                {locError && (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-1.5">Digite o endereço manualmente</p>
                    <input
                      type="text"
                      value={locAddress ?? ''}
                      onChange={(e) => setLocAddress(e.target.value)}
                      placeholder="Ex: Quadra 305 Sul, Palmas, TO"
                      className="w-full text-xs text-gray-800 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                )}
              </div>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              disabled={!selectedCategory || !imageFile || !locAddress || isCreating || isUploading}
            >
              {isUploading ? 'Enviando foto...' : isCreating ? 'Enviando...' : 'Enviar Denúncia'}
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
