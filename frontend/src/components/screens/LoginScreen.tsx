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
    <div className="h-full flex flex-col bg-gradient-to-br from-primary to-indigo-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="p-6 relative z-10">
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={onBack}
          className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white transition-colors hover:bg-white/30"
        >
          <MdArrowBack className="w-6 h-6" />
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-12 relative z-10">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="w-full max-w-md"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 flex items-center justify-center"
          >
            <MdLocationOn className="w-16 h-16 text-white" />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-8 space-y-2"
          >
            <h2 className="text-4xl font-bold text-white">Bem-vindo</h2>
            <p className="text-white/80 text-lg">Entre para acompanhar suas denúncias</p>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-3xl shadow-2xl p-8 space-y-6"
          >
            <Button
              className="w-full bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 shadow-md"
              size="lg"
              onClick={onLogin}
            >
              <FcGoogle className="w-6 h-6 mr-3" />
              Continuar com Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">ou entre com e-mail</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <MdEmail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${emailError ? 'text-red-500' : 'text-gray-400'}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => email && validateEmail(email)}
                    placeholder="seu@email.com"
                    className={`w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 transition-all ${emailError ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-100 focus:border-primary focus:ring-primary/20'} focus:outline-none focus:ring-2`}
                  />
                </div>
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 mt-1.5 ml-1 flex items-center gap-1"
                  >
                    <span className="w-1 h-1 bg-red-600 rounded-full" />
                    {emailError}
                  </motion.p>
                )}
              </div>

              <div>
                <div className="relative">
                  <MdLock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${passwordError ? 'text-red-500' : 'text-gray-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Sua senha"
                    className={`w-full pl-12 pr-12 py-4 rounded-xl bg-gray-50 border-2 transition-all ${passwordError ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-100 focus:border-primary focus:ring-primary/20'} focus:outline-none focus:ring-2`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <MdVisibilityOff className="w-5 h-5" /> : <MdVisibility className="w-5 h-5" />}
                  </button>
                </div>
                {passwordError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 mt-1.5 ml-1 flex items-center gap-1"
                  >
                    <span className="w-1 h-1 bg-red-600 rounded-full" />
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
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </div>
                ) : 'Entrar'}
              </Button>
            </form>

            <button
              type="button"
              onClick={onAnonymous}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors font-medium"
            >
              Continuar sem conta
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
