import { useState } from 'react';
import { MdArrowBack, MdNotifications, MdLanguage, MdExpandMore } from 'react-icons/md';
import { motion, AnimatePresence } from 'motion/react';

// ── FAQ data ──────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    question: 'Como faço uma denúncia?',
    answer: 'Toque no botão verde "+" no mapa principal, tire uma foto do problema, selecione a categoria (buraco, lixo, iluminação, etc.) e envie. Sua localização é detectada automaticamente.',
  },
  {
    question: 'Quanto tempo leva para resolver?',
    answer: 'O tempo médio é de 5 a 7 dias úteis. Buracos e problemas de iluminação costumam ser priorizados. Você pode acompanhar em tempo real pelo app.',
  },
  {
    question: 'Posso acompanhar minhas denúncias?',
    answer: 'Sim! Acesse "Minhas Denúncias" no menu principal. Lá você vê o histórico completo, o status atual (Aberto, Em Análise ou Resolvido) e o prazo estimado.',
  },
  {
    question: 'Como entro em contato com suporte?',
    answer: 'Envie um e-mail para suporte@denuncias.sp.gov.br, ligue gratuitamente para o 156 ou use o chat ao vivo disponível de segunda a sexta, das 8h às 18h.',
  },
  {
    question: 'Posso denunciar anonimamente?',
    answer: 'Sim. Na tela de login, escolha "Continuar como visitante". Denúncias anônimas são tratadas com a mesma prioridade, mas você não poderá acompanhar o andamento.',
  },
  {
    question: 'A prefeitura realmente analisa as denúncias?',
    answer: 'Todas as denúncias são encaminhadas automaticamente para a secretaria responsável. Você recebe uma notificação a cada mudança de status.',
  },
];

// ── Accordion de FAQ ──────────────────────────────────────────────────────────

function HelpContent() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(prev => (prev === i ? null : i));

  return (
    <div className="space-y-4">
      {/* Cards de FAQ */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Perguntas Frequentes</h3>
          <p className="text-xs text-gray-500 mt-0.5">Toque em uma pergunta para ver a resposta</p>
        </div>

        <div className="divide-y divide-gray-100">
          {FAQ_ITEMS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i}>
                {/* Cabeçalho do card — sempre visível */}
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className={`text-sm font-semibold leading-snug transition-colors ${isOpen ? 'text-primary' : 'text-gray-800'}`}>
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <MdExpandMore className={`w-5 h-5 transition-colors ${isOpen ? 'text-primary' : 'text-gray-400'}`} />
                  </motion.div>
                </button>

                {/* Resposta — aparece com animação */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="px-4 pb-4 pt-1">
                        <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg px-3 py-2.5">
                          <p className="text-sm text-gray-700 leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card de contato */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
        <h3 className="font-bold mb-1">Ainda precisa de ajuda?</h3>
        <p className="text-sm text-white/80 mb-3">Nossa equipe está disponível 24/7</p>
        <div className="space-y-2 text-sm">
          <p>📧 suporte@denuncias.sp.gov.br</p>
          <p>📞 156 (Ligação gratuita)</p>
          <p>💬 Chat ao vivo (8h–18h)</p>
        </div>
      </div>
    </div>
  );
}

// ── SettingsScreen ────────────────────────────────────────────────────────────

interface SettingsScreenProps {
  onBack: () => void;
  settingType?: 'notifications' | 'language' | 'help';
}

export function SettingsScreen({ onBack, settingType = 'notifications' }: SettingsScreenProps) {
  const [enablePush, setEnablePush] = useState(true);
  const [enableEmail, setEnableEmail] = useState(true);
  const [enableSound, setEnableSound] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR');

  const renderContent = () => {
    switch (settingType) {
      case 'notifications':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-4">Notificações Push</h3>
              <div className="space-y-3">
                {[
                  { label: 'Atualizações de Status', desc: 'Receba quando suas denúncias forem atualizadas', checked: enablePush, onChange: setEnablePush },
                  { label: 'Notificações por E-mail', desc: 'Resumo diário das suas denúncias', checked: enableEmail, onChange: setEnableEmail },
                  { label: 'Sons de Notificação', desc: 'Reproduzir som ao receber notificações', checked: enableSound, onChange: setEnableSound }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => item.onChange(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-4">Selecione o Idioma</h3>
              <div className="space-y-2">
                {[
                  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' }
                ].map((lang) => (
                  <label
                    key={lang.code}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedLanguage === lang.code
                        ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-md'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="language"
                      value={lang.code}
                      checked={selectedLanguage === lang.code}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-semibold text-sm">{lang.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'help':
        return <HelpContent />;

      default:
        return null;
    }
  };

  const titles = { notifications: 'Notificações', language: 'Idioma', help: 'Ajuda e Suporte' };
  const icons = { notifications: MdNotifications, language: MdLanguage, help: MdNotifications };
  const Icon = icons[settingType];

  return (
    <div className="h-full flex flex-col bg-background overflow-y-auto">
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
              <MdArrowBack className="w-5 h-5" />
            </button>
            <div className="flex-1 flex items-center gap-2">
              <Icon className="w-5 h-5" />
              <div>
                <h2 className="font-bold">{titles[settingType]}</h2>
                <p className="text-white/80 text-xs">Personalize suas preferências</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-1 p-4 max-w-3xl mx-auto w-full"
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}
