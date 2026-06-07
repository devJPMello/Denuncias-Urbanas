import { useState } from 'react';
import { MdArrowBack, MdLocationOn, MdLock, MdEmail, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { motion } from 'motion/react';
import { useAdminAuth } from '../../lib/auth';
import { api } from '../../services/api';

// ── Admin Login ───────────────────────────────────────────────────────────────

interface AdminLoginScreenProps {
  onBack:  () => void;
  onLogin: () => void;
}

export function AdminLoginScreen({ onBack, onLogin }: AdminLoginScreenProps) {
  const { login } = useAdminAuth();
  const [email, setEmail]         = useState('');
  const [senha, setSenha]         = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<{ token: string; primeiroLogin: boolean }>(
        '/auth/login',
        { email, senha },
      );
      login(res.token, res.primeiroLogin);
      onLogin();
    } catch (err) {
      setError('E-mail ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-gradient-to-br from-primary to-indigo-600 relative overflow-hidden">
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

      {/* Coluna esquerda — branding */}
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
            Painel<br />Municipal
          </h1>
          <p className="text-white/80 text-base lg:text-lg max-w-xs leading-relaxed">
            Acesso exclusivo para administradores com conta @denunUrban.com
          </p>
        </motion.div>
      </div>

      {/* Botão voltar */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={onBack}
        className="absolute top-4 left-4 z-20 p-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-white transition-colors hover:bg-white/30"
      >
        <MdArrowBack className="w-5 h-5" />
      </motion.button>

      {/* Coluna direita — formulário */}
      <div className="flex-1 flex flex-col relative z-10 overflow-y-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="md:hidden flex flex-col items-center px-6 pt-[calc(5.5rem+env(safe-area-inset-top,0px))] pb-4 mb-2"
        >
          <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <MdLocationOn className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Painel Municipal</h2>
          <p className="text-white/80 text-sm mt-2 text-center max-w-[260px]">
            Acesso exclusivo para administradores
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex-1 flex items-start md:items-center justify-center px-6 md:px-10 lg:px-16 pb-8 pt-2 md:pt-0"
        >
          <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-5">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Entrar</h3>
              <p className="text-sm text-gray-500 mt-1">Use sua conta @denunUrban.com</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">E-mail</label>
              <div className="relative">
                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@denunUrban.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Senha</label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSenha ? <MdVisibilityOff className="w-5 h-5" /> : <MdVisibility className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-md disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

// ── Admin Change Password ─────────────────────────────────────────────────────

interface AdminChangePasswordScreenProps {
  onSuccess: () => void;
}

export function AdminChangePasswordScreen({ onSuccess }: AdminChangePasswordScreenProps) {
  const { token, login } = useAdminAuth();
  const [novaSenha, setNovaSenha]         = useState('');
  const [confirmar, setConfirmar]         = useState('');
  const [showSenha, setShowSenha]         = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (novaSenha !== confirmar) { setError('As senhas não coincidem.'); return; }
    if (novaSenha.length < 6)   { setError('A senha deve ter no mínimo 6 caracteres.'); return; }
    setLoading(true);
    try {
      const res = await api.post<{ token: string }>(
        '/auth/change-password',
        { novaSenha },
        token,
      );
      login(res.token, false);
      onSuccess();
    } catch {
      setError('Erro ao alterar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-primary to-indigo-600 p-6">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-5"
      >
        <div>
          <h3 className="text-xl font-bold text-gray-900">Definir nova senha</h3>
          <p className="text-sm text-gray-500 mt-1">
            É necessário alterar a senha no primeiro acesso.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Nova senha</label>
          <div className="relative">
            <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showSenha ? 'text' : 'password'}
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              className="w-full pl-10 pr-12 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowSenha(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showSenha ? <MdVisibilityOff className="w-5 h-5" /> : <MdVisibility className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Confirmar senha</label>
          <div className="relative">
            <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showSenha ? 'text' : 'password'}
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              placeholder="Repita a nova senha"
              required
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 bg-gray-50 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-md disabled:opacity-60"
        >
          {loading ? 'Salvando...' : 'Salvar nova senha'}
        </button>
      </motion.form>
    </div>
  );
}
