import { useState } from 'react';
import { Button } from '../Button';
import { MdArrowBack, MdLocationOn, MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { FcGoogle } from 'react-icons/fc';
import { motion } from 'motion/react';

interface LoginScreenProps {
  onBack: () => void;
  onLogin: () => void;
  onAnonymous: () => void;
}

export function LoginScreen({ onBack, onLogin, onAnonymous }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value: string) => {
    if (!value) { setEmailError(''); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) { setEmailError('E-mail inválido'); return false; }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) validateEmail(value);
    else setEmailError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    if (!email) { setEmailError('E-mail é obrigatório'); hasError = true; }
    else if (!validateEmail(email)) { hasError = true; }
    if (!password) { setPasswordError('Senha é obrigatória'); hasError = true; }
    else if (password.length < 6) { setPasswordError('Senha deve ter no mínimo 6 caracteres'); hasError = true; }
    if (hasError) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onLogin();
  };

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

      {/* Painel esquerdo — branding (visível só em desktop) */}
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
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Denúncias<br />Urbanas</h1>
          <p className="text-white/80 text-base lg:text-lg max-w-xs leading-relaxed">
            Faça parte da transformação da sua cidade. Registre, acompanhe e resolva.
          </p>
          <div className="mt-8 flex flex-col gap-3 text-left max-w-xs mx-auto">
            {['Notificações em tempo real', 'Geolocalização precisa', 'Acompanhamento do status'].map((f, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 text-white/90"
              >
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <span className="text-sm">{f}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex flex-col relative z-10 overflow-y-auto">
        <div className="p-4 md:p-6">
          <motion.button
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={onBack}
            className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-white transition-colors hover:bg-white/30"
          >
            <MdArrowBack className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 md:px-10 lg:px-16 pb-8">
          {/* Header — visível só em mobile */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="md:hidden flex flex-col items-center mb-6"
          >
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mb-3">
              <MdLocationOn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Bem-vindo</h2>
            <p className="text-white/80 text-sm mt-1">Entre para acompanhar suas denúncias</p>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-md mx-auto md:mx-0"
          >
            <div className="hidden md:block mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Entrar na conta</h2>
              <p className="text-gray-500 text-sm mt-1">Acesse sua conta para continuar</p>
            </div>

            <Button
              className="w-full bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 shadow-sm mb-4"
              size="lg"
              onClick={onLogin}
            >
              <FcGoogle className="w-5 h-5 mr-3" />
              Continuar com Google
            </Button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400">ou entre com e-mail</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <MdEmail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors ${emailError ? 'text-red-500' : 'text-gray-400'}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => email && validateEmail(email)}
                    placeholder="seu@email.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-2 text-sm transition-all ${emailError ? 'border-red-400 focus:ring-red-500/20' : 'border-gray-100 focus:border-primary focus:ring-primary/20'} focus:outline-none focus:ring-2`}
                  />
                </div>
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600 mt-1.5 ml-1"
                  >
                    {emailError}
                  </motion.p>
                )}
              </div>

              <div>
                <div className="relative">
                  <MdLock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors ${passwordError ? 'text-red-500' : 'text-gray-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Sua senha"
                    className={`w-full pl-10 pr-10 py-3 rounded-xl bg-gray-50 border-2 text-sm transition-all ${passwordError ? 'border-red-400 focus:ring-red-500/20' : 'border-gray-100 focus:border-primary focus:ring-primary/20'} focus:outline-none focus:ring-2`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <MdVisibilityOff className="w-4.5 h-4.5" /> : <MdVisibility className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {passwordError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-600 mt-1.5 ml-1"
                  >
                    {passwordError}
                  </motion.p>
                )}
              </div>

              <div className="text-right">
                <button type="button" className="text-sm text-primary hover:text-blue-700 font-medium transition-colors">
                  Esqueci minha senha
                </button>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </div>
                ) : 'Entrar'}
              </Button>
            </form>

            <button
              type="button"
              onClick={onAnonymous}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-3 mt-2 transition-colors"
            >
              Continuar sem conta
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
