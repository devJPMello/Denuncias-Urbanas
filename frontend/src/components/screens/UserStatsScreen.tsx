import { MdArrowBack, MdTrendingUp, MdStar, MdBarChart, MdCheckCircle, MdAccessTime } from 'react-icons/md';
import { ExportButton } from '../ExportButton';
import { motion } from 'motion/react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UserStatsScreenProps {
  onBack: () => void;
}

const monthlyData = [
  { month: 'Jan', reports: 2 },
  { month: 'Fev', reports: 3 },
  { month: 'Mar', reports: 1 },
  { month: 'Abr', reports: 4 },
  { month: 'Mai', reports: 2 }
];

const categoryData = [
  { name: 'Buraco', count: 5 },
  { name: 'Lixo', count: 3 },
  { name: 'Iluminação', count: 2 },
  { name: 'Calçada', count: 2 }
];

const achievements = [
  { name: 'Primeiro Passo', description: 'Fez sua primeira denúncia', icon: '🎯', unlocked: true },
  { name: 'Colaborador Ativo', description: 'Registrou 10 denúncias', icon: '⭐', unlocked: true },
  { name: 'Guardião da Cidade', description: 'Registre 50 denúncias', icon: '🏆', unlocked: false, progress: 24 },
  { name: 'Vizinhança Melhor', description: 'Teve 5 denúncias resolvidas', icon: '🏘️', unlocked: true }
];

export function UserStatsScreen({ onBack }: UserStatsScreenProps) {
  const stats = [
    { label: 'Total de Denúncias', value: '12', icon: MdBarChart, gradient: 'from-blue-500 to-blue-600', description: 'Denúncias registradas' },
    { label: 'Taxa de Resolução', value: '67%', icon: MdCheckCircle, gradient: 'from-green-500 to-green-600', description: '8 de 12 resolvidas' },
    { label: 'Tempo Médio', value: '6 dias', icon: MdAccessTime, gradient: 'from-purple-500 to-purple-600', description: 'Até resolução' },
    { label: 'Nível Cidadão', value: 'Ouro', icon: MdStar, gradient: 'from-amber-500 to-orange-500', description: '520 pontos' }
  ];

  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto">
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
              <MdArrowBack className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h2 className="font-bold">Minhas Estatísticas</h2>
              <p className="text-white/80 text-xs">Seu impacto na comunidade</p>
            </div>
            <ExportButton variant="secondary" size="sm" onExport={(format) => console.log(`Exportando em ${format}`)} />
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 max-w-5xl mx-auto w-full space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-gradient-to-br ${stat.gradient} text-white rounded-xl p-4 shadow-lg`}
            >
              <stat.icon className="w-8 h-8 text-white/80 mb-2" />
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-xs text-white/90 font-semibold">{stat.label}</p>
              <p className="text-[11px] text-white/70 mt-0.5">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-border p-4"
          >
            <h3 className="font-bold text-gray-900 mb-4">Denúncias por Mês</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem', fontSize: '12px' }} />
                <Line type="monotone" dataKey="reports" name="Denúncias" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-border p-4"
          >
            <h3 className="font-bold text-gray-900 mb-4">Por Categoria</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem', fontSize: '12px' }} />
                <Bar dataKey="count" name="Denúncias" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-border p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Conquistas</h3>
            <div className="text-xs text-gray-500">
              {achievements.filter(a => a.unlocked).length} de {achievements.length}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievements.map((achievement, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border-2 transition-all ${achievement.unlocked ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{achievement.name}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{achievement.description}</p>
                    {!achievement.unlocked && achievement.progress && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Progresso</span>
                          <span className="text-xs font-semibold text-gray-700">{achievement.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-gradient-to-r from-primary to-blue-600 h-1.5 rounded-full" style={{ width: `${achievement.progress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                  {achievement.unlocked && <MdCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <MdTrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Você está fazendo a diferença!</h3>
              <p className="text-sm text-white/90">Suas denúncias ajudam a melhorar a cidade. Continue colaborando!</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
