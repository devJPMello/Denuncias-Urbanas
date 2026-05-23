import { useState } from 'react';
import { MdSearch, MdAdd, MdList, MdPerson, MdFilterList, MdCamera, MdLocationOn, MdClose } from 'react-icons/md';
import { CategoryType, CategoryChip } from '../CategoryChip';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { Textarea } from '../Textarea';
import { motion } from 'motion/react';

interface MapScreenProps {
  onNewReport: () => void;
  onMyReports: () => void;
  onProfile: () => void;
}

const mockReports = [
  { id: '1', category: 'buraco' as CategoryType, address: 'Av. Paulista, 1000' },
  { id: '2', category: 'lixo' as CategoryType, address: 'Rua Augusta, 500' },
  { id: '3', category: 'iluminacao' as CategoryType, address: 'Rua Consolação, 200' },
];

const categories: CategoryType[] = ['buraco', 'lixo', 'iluminacao', 'calcada', 'outros'];

export function MapScreen({ onMyReports, onProfile }: MapScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

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
                <button onClick={onProfile} className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                  <MdPerson className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
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
              {mockReports.map((report, i) => (
                <motion.div
                  key={report.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md cursor-pointer transition-all border border-gray-100"
                >
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0 shadow shadow-red-500/50" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{report.address}</p>
                    <p className="text-xs text-gray-500 capitalize">{report.category}</p>
                  </div>
                  <span className="text-[11px] text-gray-400">2h</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex-1 relative bg-gradient-to-br from-blue-50 to-indigo-50 order-1 md:order-2 min-h-[40vh] md:min-h-0">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-10">
                {Array.from({ length: 144 }).map((_, i) => (
                  <div key={i} className="border border-gray-300" />
                ))}
              </div>

              {mockReports.map((report, i) => (
                <motion.div
                  key={report.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="absolute w-9 h-9 bg-gradient-to-br from-red-500 to-red-600 rounded-full border-[3px] border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                  style={{ left: `${20 + i * 25}%`, top: `${30 + i * 15}%` }}
                >
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                </motion.div>
              ))}

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl">
                  <MdLocationOn className="w-8 h-8 text-primary mx-auto mb-1" />
                  <p className="text-xs font-semibold text-gray-700">Mapa Interativo</p>
                  <p className="text-[11px] text-gray-500">{mockReports.length} denúncias próximas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, rotate: 90, transition: { type: 'spring', stiffness: 400 } }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }}
          onClick={() => setShowNewReportModal(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-2xl hover:shadow-green-500/50 flex items-center justify-center z-30"
        >
          <MdAdd className="w-7 h-7" />
        </motion.button>
      </div>

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
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
                <p className="text-sm text-gray-600 mt-1">Av. Paulista, 1578 - Bela Vista, São Paulo</p>
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
