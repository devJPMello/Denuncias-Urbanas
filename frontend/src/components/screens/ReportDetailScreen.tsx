import { MdArrowBack, MdLocationOn, MdCalendarToday, MdCheck, MdWifi } from 'react-icons/md';
import { Badge } from '../Badge';
import { categoryConfig, CategoryType } from '../CategoryChip';
import { LeafletMap, MapMarker } from '../LeafletMap';
import { SkeletonCard } from '../Skeleton';
import { motion, AnimatePresence } from 'motion/react';
import { useRealTimeComplaint } from '../../hooks/useRealTimeComplaint';
import { useDenuncia } from '../../hooks/api/useDenuncia';

// ── Props ─────────────────────────────────────────────────────────────────────
interface ReportDetailScreenProps {
  reportId: string | null;
  onBack: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const statusLabels = { open: 'Aberto', analysis: 'Em Análise', resolved: 'Resolvido' };

const STATUS_TIMELINE: Record<string, Array<{ status: string; label: string }>> = {
  open:     [
    { status: 'open',     label: 'Denúncia recebida'      },
    { status: '',         label: 'Em análise pela equipe' },
    { status: '',         label: 'Resolvido'              },
  ],
  analysis: [
    { status: 'open',     label: 'Denúncia recebida'      },
    { status: 'analysis', label: 'Em análise pela equipe' },
    { status: '',         label: 'Resolvido'              },
  ],
  resolved: [
    { status: 'open',     label: 'Denúncia recebida'      },
    { status: 'analysis', label: 'Em análise pela equipe' },
    { status: 'resolved', label: 'Resolvido'              },
  ],
};

// ── Component ─────────────────────────────────────────────────────────────────
export function ReportDetailScreen({ reportId, onBack }: ReportDetailScreenProps) {
  const { complaint, isLoading, error } = useDenuncia(reportId);

  // ── Tempo real ───────────────────────────────────────────────────────────────
  const { liveStatus, liveUpdatedAt, hasLiveUpdate } =
    useRealTimeComplaint(reportId ?? '');

  const currentStatus = liveStatus ?? complaint?.status ?? 'open';
  const category      = (complaint?.category ?? 'outros') as CategoryType;
  const Icon          = categoryConfig[category].icon;
  const config        = categoryConfig[category];
  const timeline      = STATUS_TIMELINE[currentStatus] ?? STATUS_TIMELINE.open;

  // ── Loading state ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-background overflow-y-auto p-4 space-y-3">
        <button onClick={onBack} className="flex items-center gap-2 text-primary font-semibold text-sm mb-2">
          <MdArrowBack className="w-5 h-5" /> Voltar
        </button>
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error || !complaint) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background gap-4 p-6">
        <p className="text-sm text-red-500 text-center">{error ?? 'Denúncia não encontrada'}</p>
        <button onClick={onBack} className="px-4 py-2 bg-primary text-white text-sm rounded-lg">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto">
      <div className="relative h-52">
        {complaint.image ? (
          <img src={complaint.image} alt="Denúncia" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Icon className="w-16 h-16 text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/30 transition-colors text-white"
        >
          <MdArrowBack className="w-5 h-5" />
        </button>

        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 flex-wrap">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br ${config.gradient} rounded-lg shadow-md`}>
            <Icon className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold">{config.label}</span>
          </div>
          <Badge status={currentStatus} className="!w-auto px-3 shadow-md">
            {statusLabels[currentStatus]}
          </Badge>

          <AnimatePresence>
            {hasLiveUpdate && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 px-2 py-0.5 bg-green-500/90 backdrop-blur-sm rounded-full"
              >
                <MdWifi className="w-3 h-3 text-white" />
                <span className="text-white text-[10px] font-semibold">ao vivo</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 -mt-4 bg-background rounded-t-2xl relative z-10">
        <div className="p-4 space-y-3 max-w-2xl mx-auto">

          {/* Atualização em tempo real */}
          <AnimatePresence>
            {hasLiveUpdate && liveUpdatedAt && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                <p className="text-sm text-green-800 font-medium">
                  Status atualizado em tempo real —{' '}
                  <span className="font-bold">{statusLabels[currentStatus]}</span>
                  <span className="text-green-600 font-normal">
                    {' '}às {liveUpdatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Título */}
          {complaint.title && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-xl shadow-sm p-4"
            >
              <h2 className="text-base font-bold text-gray-900">{complaint.title}</h2>
            </motion.div>
          )}

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
                <p className="text-sm font-semibold text-gray-900">{complaint.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <MdCalendarToday className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Data de Registro</p>
                <p className="text-sm font-semibold text-gray-900">{complaint.date}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-3 md:grid-cols-2">
            {complaint.description && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-4"
              >
                <h3 className="font-bold mb-2 text-gray-900">Descrição</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{complaint.description}</p>
              </motion.div>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-4"
            >
              <h3 className="font-bold mb-3 text-gray-900">Linha do Tempo</h3>
              <div className="space-y-3">
                {timeline.map((item, index) => {
                  const active = item.status !== '' && (
                    item.status === 'open' ||
                    (item.status === 'analysis' && (currentStatus === 'analysis' || currentStatus === 'resolved')) ||
                    (item.status === 'resolved' && currentStatus === 'resolved')
                  );
                  return (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${active ? 'bg-gradient-to-br from-green-500 to-green-600 shadow shadow-green-500/30' : 'bg-gray-200'}`}>
                          {active && <MdCheck className="w-2.5 h-2.5 text-white" />}
                        </div>
                        {index < timeline.length - 1 && (
                          <div className={`w-0.5 h-8 ${active ? 'bg-green-500' : 'bg-gray-200'}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className={`text-sm font-semibold ${active ? 'text-gray-900' : 'text-gray-400'}`}>{item.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Mapa */}
          {complaint.lat && complaint.lng && (
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
                  <p className="text-xs text-gray-500">{complaint.address}</p>
                </div>
              </div>
              <div className="relative h-48">
                <LeafletMap
                  center={[complaint.lat, complaint.lng]}
                  zoom={16}
                  markers={[{
                    id: complaint.id,
                    lat: complaint.lat,
                    lng: complaint.lng,
                    color: '#EF4444',
                    popupHtml: `<div style="font-family:sans-serif;font-size:13px"><strong>${complaint.address}</strong></div>`,
                  } as MapMarker]}
                  className="absolute inset-0"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
