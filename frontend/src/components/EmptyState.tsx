import { motion } from 'motion/react';
import { MdSearchOff, MdInbox, MdFilterList, MdAddCircleOutline } from 'react-icons/md';
import { Button } from './Button';

type EmptyStateType = 'no-results' | 'no-data' | 'no-filter-results' | 'getting-started';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

const emptyStateConfig = {
  'no-results': {
    icon: MdSearchOff,
    defaultTitle: 'Nenhum resultado encontrado',
    defaultMessage: 'Tente ajustar sua busca ou filtros',
    gradient: 'from-gray-400 to-gray-500'
  },
  'no-data': {
    icon: MdInbox,
    defaultTitle: 'Nenhuma denúncia ainda',
    defaultMessage: 'Comece criando sua primeira denúncia',
    gradient: 'from-blue-400 to-blue-500'
  },
  'no-filter-results': {
    icon: MdFilterList,
    defaultTitle: 'Nenhuma denúncia encontrada',
    defaultMessage: 'Tente ajustar os filtros aplicados',
    gradient: 'from-amber-400 to-amber-500'
  },
  'getting-started': {
    icon: MdAddCircleOutline,
    defaultTitle: 'Bem-vindo!',
    defaultMessage: 'Crie sua primeira denúncia para começar',
    gradient: 'from-green-400 to-green-500'
  }
};

export function EmptyState({
  type = 'no-data',
  title,
  message,
  actionLabel,
  onAction,
  icon
}: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const Icon = icon || config.icon;
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className={`w-24 h-24 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-6 shadow-lg`}
      >
        <Icon className="w-12 h-12 text-white" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-bold text-gray-900 mb-2 text-center"
      >
        {displayTitle}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-gray-500 mb-6 text-center max-w-md"
      >
        {displayMessage}
      </motion.p>

      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button onClick={onAction} size="lg">
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
