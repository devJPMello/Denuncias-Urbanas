import { useState } from 'react';
import { MdArrowBack, MdNotifications, MdLanguage } from 'react-icons/md';
import { motion } from 'motion/react';

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
                  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
                  { code: 'en-US', name: 'English (United States)', flag: '🇺🇸' },
                  { code: 'es-ES', name: 'Español (España)', flag: '🇪🇸' }
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
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-4">Perguntas Frequentes</h3>
              <div className="space-y-3">
                {[
                  { question: 'Como faço uma denúncia?', answer: 'Clique no botão verde "+" no mapa principal, tire uma foto, selecione a categoria e envie.' },
                  { question: 'Quanto tempo leva para resolver?', answer: 'O tempo médio de resolução é de 5-7 dias úteis, dependendo da categoria e complexidade.' },
                  { question: 'Posso acompanhar minhas denúncias?', answer: 'Sim! Acesse "Minhas Denúncias" no menu principal para ver o status de todas elas.' },
                  { question: 'Como entro em contato com suporte?', answer: 'Envie um e-mail para suporte@denuncias.sp.gov.br ou ligue para 156.' }
                ].map((faq, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-sm text-gray-900 mb-2">{faq.question}</p>
                    <p className="text-xs text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
              <h3 className="font-bold mb-2">Ainda precisa de ajuda?</h3>
              <p className="text-sm text-white/90 mb-3">Nossa equipe está disponível 24/7</p>
              <div className="space-y-2 text-sm">
                <p>📧 suporte@denuncias.sp.gov.br</p>
                <p>📞 156 (Ligação gratuita)</p>
                <p>💬 Chat ao vivo (8h-18h)</p>
              </div>
            </div>
          </div>
        );

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
