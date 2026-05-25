import { useEffect } from 'react';
import { SignIn } from '@clerk/clerk-react';
import { MdArrowBack, MdLocationOn, MdNotifications, MdVerifiedUser } from 'react-icons/md';
import { motion } from 'motion/react';
import { useAppAuth, CLERK_ENABLED } from '../../lib/auth';

interface LoginScreenProps {
  onBack: () => void;
  onLogin: () => void;
  onAnonymous: () => void;
}

export function LoginScreen({ onBack, onLogin }: LoginScreenProps) {
  const { isSignedIn, isLoaded } = useAppAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      onLogin();
    }
  }, [isLoaded, isSignedIn]);

  return (
    <div className="h-full flex flex-col md:flex-row bg-gradient-to-br from-primary to-indigo-600 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* Coluna esquerda — branding (desktop) */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center px-12 lg:px-16 relative z-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-white/15 backdrop-blur-lg rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <MdLocationOn className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Denúncias<br />Urbanas
          </h1>
          <p className="text-white/80 text-base lg:text-lg max-w-xs leading-relaxed">
            Faça parte da transformação da sua cidade. Registre, acompanhe e resolva.
          </p>
          <div className="mt-8 flex flex-col gap-3 text-left max-w-xs mx-auto">
            {[
              { icon: MdNotifications, label: 'Notificações em tempo real' },
              { icon: MdLocationOn,    label: 'Geolocalização precisa'     },
              { icon: MdVerifiedUser,  label: 'Plataforma segura'          },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 text-white/90"
              >
                <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">{f.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Botão voltar — canto superior esquerdo fixo */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={onBack}
        className="absolute top-4 left-4 z-20 p-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-white transition-colors hover:bg-white/30"
      >
        <MdArrowBack className="w-5 h-5" />
      </motion.button>

      {/* Coluna direita — formulário Clerk */}
      <div className="flex-1 flex flex-col relative z-10 overflow-y-auto">

        {/* Header mobile — afastado do topo (botão voltar + notch) */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="md:hidden flex flex-col items-center px-6 pt-[calc(5.5rem+env(safe-area-inset-top,0px))] pb-4 mb-2"
        >
          <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <MdLocationOn className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Bem-vindo</h2>
          <p className="text-white/80 text-sm mt-2 text-center max-w-[260px]">
            Entre para acompanhar suas denúncias
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex-1 flex items-start md:items-center justify-center px-6 md:px-10 lg:px-16 pb-8 pt-2 md:pt-0"
        >
          <div className="w-full max-w-md">
            {!CLERK_ENABLED && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-center">
                <p className="text-sm font-semibold text-amber-800">Clerk não configurado</p>
                <p className="text-xs text-amber-600 mt-1">Adicione <code className="bg-amber-100 px-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> no <code className="bg-amber-100 px-1 rounded">frontend/.env</code></p>
                <button onClick={onLogin} className="mt-3 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  Entrar sem autenticação
                </button>
              </div>
            )}
            {CLERK_ENABLED && <SignIn
              routing="virtual"
              appearance={{
                variables: {
                  colorPrimary: '#2563EB',
                  colorBackground: '#ffffff',
                  colorText: '#111827',
                  colorTextSecondary: '#6B7280',
                  colorInputBackground: '#F9FAFB',
                  colorInputText: '#111827',
                  borderRadius: '0.75rem',
                  fontFamily: 'inherit',
                },
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-2xl rounded-2xl md:rounded-3xl border-0 w-full',
                  headerTitle: 'text-xl font-bold text-gray-900',
                  headerSubtitle: 'text-sm text-gray-500',
                  socialButtonsBlockButton: 'border-2 border-gray-200 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors',
                  socialButtonsBlockButtonText: 'font-medium text-sm',
                  dividerLine: 'bg-gray-200',
                  dividerText: 'text-gray-400 text-xs px-3',
                  formFieldLabel: 'text-sm font-medium text-gray-700 mb-1',
                  formFieldInput: 'border-2 border-gray-100 bg-gray-50 rounded-xl text-sm py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all',
                  formButtonPrimary: 'bg-primary hover:bg-blue-700 rounded-xl text-sm font-semibold py-3 transition-colors shadow-md',
                  footerActionLink: 'text-primary font-semibold hover:text-blue-700',
                  identityPreviewText: 'text-sm text-gray-700',
                  identityPreviewEditButton: 'text-primary text-sm',
                  alertText: 'text-sm',
                  formFieldErrorText: 'text-xs text-red-600 mt-1',
                },
              }}
            />}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
