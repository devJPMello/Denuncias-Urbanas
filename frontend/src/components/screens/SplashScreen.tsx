import { Button } from '../Button';
import { MdLocationOn, MdNotifications, MdVerifiedUser } from 'react-icons/md';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onLogin: () => void;
  onRegister: () => void;
  onAdmin: () => void;
}

export function SplashScreen({ onLogin, onAdmin }: SplashScreenProps) {
  const features = [
    { icon: MdNotifications, label: 'Notificações em tempo real' },
    { icon: MdLocationOn, label: 'Geolocalização precisa' },
    { icon: MdVerifiedUser, label: 'Plataforma segura' },
  ];

  return (
    <div className="h-full flex flex-col md:flex-row bg-gradient-to-br from-primary via-blue-500 to-indigo-600 relative overflow-hidden">
      {/* Background pattern */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 pointer-events-none"
      >
        <svg width="100%" height="100%">
          <defs>
            <pattern id="splash-dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="2" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#splash-dots)" />
        </svg>
      </motion.div>

      {/* Lado esquerdo — marca e features */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-16 py-12 relative z-10">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="bg-white/20 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-2xl mb-6 md:mb-8"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <MdLocationOn className="w-16 h-16 md:w-20 md:h-20 text-white drop-shadow-lg" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-3 mb-8 md:mb-10"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg leading-tight">
            Denúncias<br />Urbanas
          </h1>
          <p className="text-sm md:text-base text-white/90 max-w-xs md:max-w-sm leading-relaxed">
            Registre, acompanhe e resolva problemas da sua cidade de forma simples e rápida
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3 w-full max-w-xs"
        >
          {features.map((item, i) => (
            <motion.div
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-3 text-white"
            >
              <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Lado direito — ações */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring' }}
        className="md:flex-1 flex flex-col items-center justify-center px-8 md:px-16 py-8 md:py-12 relative z-10"
      >
        <div className="w-full max-w-sm space-y-4">
          <div className="hidden md:block mb-8 text-center">
            <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-2">Acesso cidadão</p>
            <div className="w-12 h-0.5 bg-white/30 mx-auto" />
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              className="w-full bg-white text-primary hover:bg-white/95 shadow-xl font-bold"
              onClick={onLogin}
            >
              Entrar na conta
            </Button>
          </motion.div>

          <motion.button
            whileHover={{ x: 4 }}
            onClick={onAdmin}
            className="w-full text-center text-sm text-white/70 hover:text-white py-2 transition-colors font-medium"
          >
            Acessar Painel Municipal →
          </motion.button>

          <p className="text-center text-xs text-white/40 pt-2">v1.0.0</p>
        </div>
      </motion.div>
    </div>
  );
}
