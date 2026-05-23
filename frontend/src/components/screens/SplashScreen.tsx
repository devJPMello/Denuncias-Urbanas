import { Button } from '../Button';
import { MdLocationOn, MdNotifications, MdVerifiedUser } from 'react-icons/md';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onLogin: () => void;
  onRegister: () => void;
  onAdmin: () => void;
}

export function SplashScreen({ onLogin, onAdmin }: SplashScreenProps) {
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-primary via-blue-500 to-indigo-600 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <svg width="100%" height="100%">
          <defs>
            <pattern id="splash-dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="2" fill="white" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#splash-dots)" />
        </svg>
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, duration: 0.4 }}
          className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 shadow-2xl mb-8 relative"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <MdLocationOn className="w-24 h-24 text-white drop-shadow-lg" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-center space-y-4 mb-12"
        >
          <h1 className="text-5xl font-bold text-white drop-shadow-lg leading-tight">
            Denúncias<br />Urbanas
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="text-xl text-white/90 max-w-sm leading-relaxed"
          >
            Registre, acompanhe e resolva problemas da sua cidade
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="grid grid-cols-3 gap-6 mb-12"
        >
          {[
            { icon: MdNotifications, label: 'Notificações' },
            { icon: MdLocationOn, label: 'Geolocalização' },
            { icon: MdVerifiedUser, label: 'Seguro' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1, type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center gap-2 text-white"
            >
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <item.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4, type: 'spring' }}
        className="p-8 space-y-4 relative z-10"
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            size="lg"
            className="w-full bg-white text-primary hover:bg-white/95 shadow-xl"
            onClick={onLogin}
          >
            Entrar com Clerk
          </Button>
        </motion.div>

        <motion.button
          whileHover={{ x: 5 }}
          onClick={onAdmin}
          className="w-full text-center text-sm text-white/80 hover:text-white py-2 transition-colors font-medium"
        >
          Acessar Painel Municipal →
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-white/50 mt-4"
        >
          v1.0.0
        </motion.p>
      </motion.div>
    </div>
  );
}
