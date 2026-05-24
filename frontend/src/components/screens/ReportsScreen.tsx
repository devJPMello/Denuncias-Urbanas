import { useState } from 'react';
import { MdTrendingUp, MdTrendingDown, MdCalendarToday, MdBarChart, MdPieChart, MdShowChart } from 'react-icons/md';
import { ExportButton } from '../ExportButton';
import { motion } from 'motion/react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Jan', total: 45, open: 12, resolved: 33 },
  { month: 'Fev', total: 52, open: 15, resolved: 37 },
  { month: 'Mar', total: 48, open: 18, resolved: 30 },
  { month: 'Abr', total: 61, open: 20, resolved: 41 },
  { month: 'Mai', total: 38, open: 14, resolved: 24 }
];

const categoryData = [
  { name: 'Buraco', value: 45, color: '#EF4444' },
  { name: 'Lixo', value: 32, color: '#F59E0B' },
  { name: 'Iluminação', value: 28, color: '#3B82F6' },
  { name: 'Calçada', value: 23, color: '#10B981' },
  { name: 'Outros', value: 12, color: '#8B5CF6' }
];

const neighborhoodData = [
  { name: 'Bela Vista', count: 24 },
  { name: 'Consolação', count: 18 },
  { name: 'Pinheiros', count: 15 },
  { name: 'Jardins', count: 12 },
  { name: 'Vila Madalena', count: 10 }
];

export function ReportsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const stats = [
    { label: 'Total de Denúncias', value: '244', change: '+12%', trend: 'up', icon: MdBarChart, gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
    { label: 'Taxa de Resolução', value: '68%', change: '+5%', trend: 'up', icon: MdShowChart, gradient: 'from-green-500 to-green-600', shadow: 'shadow-green-500/20' },
    { label: 'Tempo Médio', value: '5.2 dias', change: '-8%', trend: 'down', icon: MdCalendarToday, gradient: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/20' },
    { label: 'Em Aberto', value: '79', change: '+3%', trend: 'up', icon: MdPieChart, gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' }
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Relatórios e Análises</h2>
            <p className="text-sm text-gray-500 mt-1">Visão geral do desempenho e indicadores</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
              className="px-3 py-2 text-sm rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="week">Última semana</option>
              <option value="month">Último mês</option>
              <option value="year">Último ano</option>
            </select>
            <ExportButton variant="primary" size="md" onExport={(format) => console.log(`Exportando em ${format}`)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-gradient-to-br ${stat.gradient} text-white rounded-xl p-4 shadow-lg ${stat.shadow}`}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-8 h-8 text-white/80" />
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-white/20">
                  {stat.trend === 'up' ? <MdTrendingUp className="w-4 h-4" /> : <MdTrendingDown className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-white/80">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-sm border border-border p-4">
            <h3 className="font-bold text-gray-900 mb-1">Denúncias por Mês</h3>
            <p className="text-xs text-gray-500 mb-4">Evolução mensal de chamados</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="open" name="Em Aberto" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                <Bar dataKey="resolved" name="Resolvidos" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-sm border border-border p-4">
            <h3 className="font-bold text-gray-900 mb-1">Distribuição por Categoria</h3>
            <p className="text-xs text-gray-500 mb-4">Total: 140 denúncias</p>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl shadow-sm border border-border p-4">
            <h3 className="font-bold text-gray-900 mb-1">Tendência de Resolução</h3>
            <p className="text-xs text-gray-500 mb-4">Chamados resolvidos vs. total</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="total" name="Total" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="resolved" name="Resolvidos" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="bg-white rounded-xl shadow-sm border border-border p-4">
            <h3 className="font-bold text-gray-900 mb-1">Top 5 Bairros</h3>
            <p className="text-xs text-gray-500 mb-4">Maior volume de denúncias</p>
            <div className="space-y-3">
              {neighborhoodData.map((neighborhood, i) => {
                const percentage = (neighborhood.count / neighborhoodData[0].count) * 100;
                return (
                  <div key={neighborhood.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900">{neighborhood.name}</span>
                      <span className="text-sm font-bold text-primary">{neighborhood.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary to-blue-600 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
