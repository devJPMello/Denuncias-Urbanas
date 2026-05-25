import { useState } from 'react';
import { MdTrendingUp, MdTrendingDown, MdCalendarToday, MdBarChart, MdPieChart, MdShowChart } from 'react-icons/md';
import { ExportButton } from '../ExportButton';
import { motion } from 'motion/react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useDenuncias } from '../../hooks/api/useDenuncias';
import type { ApiDenuncia } from '../../types';

// ── Cores por categoria ────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  buraco:     '#EF4444',
  lixo:       '#F59E0B',
  iluminacao: '#3B82F6',
  calcada:    '#10B981',
  vandalismo: '#8B5CF6',
  outros:     '#8B5CF6',
};

const CATEGORY_LABELS: Record<string, string> = {
  buraco:     'Buraco',
  lixo:       'Lixo',
  iluminacao: 'Iluminação',
  calcada:    'Calçada',
  vandalismo: 'Vandalismo',
  outros:     'Outros',
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildMonthlyData(raw: ApiDenuncia[]) {
  const MAP: Record<string, { total: number; open: number; resolved: number }> = {};
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  raw.forEach(d => {
    const date  = new Date(d.criadoEm);
    const label = months[date.getMonth()];
    if (!MAP[label]) MAP[label] = { total: 0, open: 0, resolved: 0 };
    MAP[label].total++;
    if (d.status === 'aberto' || d.status === 'analise') MAP[label].open++;
    if (d.status === 'resolvido') MAP[label].resolved++;
  });

  // Return last 6 months with data
  return Object.entries(MAP)
    .slice(-6)
    .map(([month, v]) => ({ month, ...v }));
}

function buildCategoryData(raw: ApiDenuncia[]) {
  const MAP: Record<string, number> = {};
  raw.forEach(d => { MAP[d.categoria] = (MAP[d.categoria] ?? 0) + 1; });
  return Object.entries(MAP).map(([cat, value]) => ({
    name:  CATEGORY_LABELS[cat] ?? cat,
    value,
    color: CATEGORY_COLORS[cat] ?? '#6B7280',
  }));
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ReportsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const { raw, isLoading } = useDenuncias();

  const total    = raw.length;
  const resolved = raw.filter(r => r.status === 'resolvido').length;
  const open     = raw.filter(r => r.status === 'aberto' || r.status === 'analise').length;
  const rate     = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const monthlyData  = buildMonthlyData(raw);
  const categoryData = buildCategoryData(raw);

  const stats = [
    { label: 'Total de Denúncias', value: String(total),     change: '', trend: 'up',   icon: MdBarChart,    gradient: 'from-blue-500 to-blue-600',    shadow: 'shadow-blue-500/20' },
    { label: 'Taxa de Resolução',  value: `${rate}%`,        change: '', trend: 'up',   icon: MdShowChart,   gradient: 'from-green-500 to-green-600',   shadow: 'shadow-green-500/20' },
    { label: 'Em Aberto',          value: String(open),      change: '', trend: 'up',   icon: MdPieChart,    gradient: 'from-amber-500 to-orange-500',  shadow: 'shadow-amber-500/20' },
    { label: 'Resolvidos',         value: String(resolved),  change: '', trend: 'down', icon: MdCalendarToday, gradient: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/20' },
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

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
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
                    {stat.trend === 'up'
                      ? <MdTrendingUp className="w-5 h-5 text-white/60" />
                      : <MdTrendingDown className="w-5 h-5 text-white/60" />
                    }
                  </div>
                  <p className="text-2xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-white/80">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-border p-4">
                <h3 className="font-bold text-gray-900 mb-1">Denúncias por Mês</h3>
                <p className="text-xs text-gray-500 mb-4">Evolução mensal de chamados</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="open"     name="Em Aberto" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="resolved" name="Resolvidos" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-border p-4">
                <h3 className="font-bold text-gray-900 mb-1">Distribuição por Categoria</h3>
                <p className="text-xs text-gray-500 mb-4">Total: {total} denúncias</p>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%" cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm border border-border p-4">
                <h3 className="font-bold text-gray-900 mb-1">Tendência de Resolução</h3>
                <p className="text-xs text-gray-500 mb-4">Chamados resolvidos vs. total</p>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                    <YAxis stroke="#6B7280" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '0.5rem', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="total"    name="Total"     stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="resolved" name="Resolvidos" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-sm border border-border p-4">
                <h3 className="font-bold text-gray-900 mb-1">Distribuição por Categoria</h3>
                <p className="text-xs text-gray-500 mb-4">Quantidade de denúncias por tipo</p>
                <div className="space-y-3">
                  {categoryData.map((cat, i) => {
                    const max = Math.max(...categoryData.map(c => c.value), 1);
                    const pct = (cat.value / max) * 100;
                    return (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-900">{cat.name}</span>
                          <span className="text-sm font-bold text-primary">{cat.value}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {categoryData.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">Nenhum dado disponível</p>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
