import { MdArrowBack, MdPerson, MdEmail, MdNotifications, MdLanguage, MdHelpOutline, MdLogout, MdChevronRight, MdEdit, MdPhone, MdLocationOn, MdBarChart } from 'react-icons/md';
import { motion } from 'motion/react';

interface ProfileScreenProps {
  onBack: () => void;
  onSettingClick?: (type: 'notifications' | 'language' | 'help') => void;
  onStatsClick?: () => void;
  onLogout?: () => void;
}

export function ProfileScreen({ onBack, onSettingClick, onStatsClick, onLogout }: ProfileScreenProps) {
  const menuItems = [
    { icon: MdNotifications, label: 'Notificações', description: 'Gerenciar alertas e avisos', color: 'from-blue-500 to-blue-600', type: 'notifications' as const },
    { icon: MdLanguage, label: 'Idioma', description: 'Português (Brasil)', color: 'from-green-500 to-green-600', type: 'language' as const },
    { icon: MdHelpOutline, label: 'Ajuda e Suporte', description: 'Central de ajuda', color: 'from-purple-500 to-purple-600', type: 'help' as const }
  ];

  const stats = [
    { value: '12', label: 'Denúncias', gradient: 'from-blue-500 to-blue-600' },
    { value: '8', label: 'Em andamento', gradient: 'from-amber-500 to-amber-600' },
    { value: '4', label: 'Resolvidas', gradient: 'from-green-500 to-green-600' }
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
              <h2 className="font-bold">Meu Perfil</h2>
              <p className="text-white/80 text-xs">Gerencie suas informações</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 max-w-5xl mx-auto w-full space-y-3">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/30">
                <MdPerson className="w-8 h-8 text-white" />
              </div>
              <button className="absolute -bottom-1 -right-1 p-1.5 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors">
                <MdEdit className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-900">João Silva</h2>
              <p className="text-xs text-gray-500">Cidadão Participativo</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">Membro desde maio/2025</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={onStatsClick}
              className="bg-white rounded-xl shadow-sm p-3 text-center cursor-pointer hover:shadow-md transition-all"
            >
              <p className={`font-bold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={onStatsClick}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all p-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <MdBarChart className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Ver Estatísticas Completas</p>
              <p className="text-xs text-white/80">Conquistas e progresso</p>
            </div>
          </div>
          <MdChevronRight className="w-5 h-5" />
        </motion.button>

        <div className="grid gap-3 md:grid-cols-2">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-4 space-y-3"
          >
            <h3 className="font-bold text-gray-900">Informações de Contato</h3>
            {[
              { icon: MdEmail, color: 'from-blue-500 to-blue-600', label: 'E-mail', value: 'joao.silva@email.com' },
              { icon: MdPhone, color: 'from-green-500 to-green-600', label: 'Telefone', value: '(11) 98765-4321' },
              { icon: MdLocationOn, color: 'from-purple-500 to-purple-600', label: 'Cidade', value: 'São Paulo, SP' }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`p-2 bg-gradient-to-br ${item.color} rounded-lg`}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="px-4 pt-4 pb-2">
              <h3 className="font-bold text-gray-900">Configurações</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {menuItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => onSettingClick?.(item.type)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 bg-gradient-to-br ${item.color} rounded-lg shadow-sm`}>
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500 truncate">{item.description}</p>
                  </div>
                  <MdChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <MdLogout className="w-5 h-5" />
          <span className="text-sm font-semibold">Sair da Conta</span>
        </button>
      </div>
    </div>
  );
}
