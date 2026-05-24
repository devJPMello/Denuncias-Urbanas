import { MdArrowBack, MdLocationOn, MdCalendarToday, MdMessage, MdCheck } from 'react-icons/md';
import { Badge } from '../Badge';
import { categoryConfig, CategoryType } from '../CategoryChip';
import { LeafletMap, MapMarker } from '../LeafletMap';
import { motion } from 'motion/react';

interface ReportDetailScreenProps {
  onBack: () => void;
}

const mockReport = {
  category: 'buraco' as CategoryType,
  image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
  address: 'Av. Paulista, 1578 - Bela Vista, São Paulo - SP',
  date: '18/05/2026',
  status: 'analysis' as const,
  lat: -23.5616,
  lng: -46.6564,
  description: 'Buraco grande na pista, causando risco para veículos e pedestres. O problema se agravou após as últimas chuvas.',
  timeline: [
    { date: '18/05/2026 14:30', status: 'Denúncia recebida', active: true },
    { date: '19/05/2026 09:15', status: 'Em análise pela equipe', active: true },
    { date: 'Pendente', status: 'Resolvido', active: false }
  ],
  comments: [
    {
      author: 'Equipe Municipal',
      date: '19/05/2026',
      text: 'Recebemos sua denúncia e estamos avaliando a situação. Previsão de reparo: 7 dias.'
    }
  ]
};

const statusLabels = { open: 'Aberto', analysis: 'Em Análise', resolved: 'Resolvido' };

export function ReportDetailScreen({ onBack }: ReportDetailScreenProps) {
  const Icon = categoryConfig[mockReport.category].icon;
  const config = categoryConfig[mockReport.category];

  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto">
      <div className="relative h-52">
        <img src={mockReport.image} alt="Denúncia" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/30 transition-colors text-white"
        >
          <MdArrowBack className="w-5 h-5" />
        </button>

        <div className="absolute bottom-4 left-4 right-4">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br ${config.gradient} rounded-lg mb-2 shadow-md`}>
            <Icon className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold">{config.label}</span>
          </div>
          <div>
            <Badge status={mockReport.status}>{statusLabels[mockReport.status]}</Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 -mt-4 bg-background rounded-t-2xl relative z-10">
        <div className="p-4 space-y-3 max-w-2xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-xl shadow-sm p-4 space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <MdLocationOn className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Localização</p>
                <p className="text-sm font-semibold text-gray-900">{mockReport.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <MdCalendarToday className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Data de Registro</p>
                <p className="text-sm font-semibold text-gray-900">{mockReport.date}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-3 md:grid-cols-2">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-4"
            >
              <h3 className="font-bold mb-2 text-gray-900">Descrição</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{mockReport.description}</p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-4"
            >
              <h3 className="font-bold mb-3 text-gray-900">Linha do Tempo</h3>
              <div className="space-y-3">
                {mockReport.timeline.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.active ? 'bg-gradient-to-br from-green-500 to-green-600 shadow shadow-green-500/30' : 'bg-gray-200'}`}>
                        {item.active && <MdCheck className="w-2.5 h-2.5 text-white" />}
                      </div>
                      {index < mockReport.timeline.length - 1 && (
                        <div className={`w-0.5 h-8 ${item.active ? 'bg-green-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className={`text-sm font-semibold ${item.active ? 'text-gray-900' : 'text-gray-400'}`}>{item.status}</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <MdLocationOn className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Localização no mapa</p>
                <p className="text-xs text-gray-500">{mockReport.address}</p>
              </div>
            </div>
            <div className="relative h-48">
              <LeafletMap
                center={[mockReport.lat, mockReport.lng]}
                zoom={16}
                markers={[{
                  id: '1',
                  lat: mockReport.lat,
                  lng: mockReport.lng,
                  color: '#EF4444',
                  popupHtml: `<div style="font-family:sans-serif;font-size:13px"><strong>${mockReport.address}</strong></div>`,
                } as MapMarker]}
                className="absolute inset-0"
              />
            </div>
          </motion.div>

          {mockReport.comments.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-4"
            >
              <h3 className="font-bold mb-3 flex items-center gap-2 text-gray-900">
                <MdMessage className="w-5 h-5 text-primary" />
                Comentários da Equipe
              </h3>
              <div className="space-y-2">
                {mockReport.comments.map((comment, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900">{comment.author}</p>
                      <p className="text-[11px] text-gray-500">{comment.date}</p>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{comment.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
