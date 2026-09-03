import React, { useState } from 'react';
import { Newspaper, Trophy, Film, HeartPulse, DollarSign, RefreshCw, CheckCircle2, Sliders, ExternalLink } from 'lucide-react';

export const DynamicContentView: React.FC = () => {
  const [sources, setSources] = useState([
    {
      id: 'src-1',
      title: 'Notícias em Tempo Real (RSS)',
      category: 'Notícias',
      provider: 'G1 Brasil / Agência Brasil',
      refreshMinutes: 15,
      enabled: true,
      icon: Newspaper,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      sample: 'Governo anuncia novo pacote de estímulo fiscal para o varejo...',
    },
    {
      id: 'src-2',
      title: 'Esportes & Placar da Rodada',
      category: 'Esportes',
      provider: 'Brasileirão & Copa do Brasil Live',
      refreshMinutes: 5,
      enabled: true,
      icon: Trophy,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      sample: 'Flamengo 2 x 1 Palmeiras (Final do 2º Tempo) • São Paulo 0 x 0 Grêmio',
    },
    {
      id: 'src-3',
      title: 'Cotações & Mercado Financeiro',
      category: 'Finanças',
      provider: 'Banco Central / B3 Realtime',
      refreshMinutes: 2,
      enabled: true,
      icon: DollarSign,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      sample: 'Dólar Comercial: R$ 5,42 (+0.15%) • Euro: R$ 5,91 • Bitcoin: R$ 342.000',
    },
    {
      id: 'src-4',
      title: 'Cinema & Lançamentos da Semana',
      category: 'Entretenimento',
      provider: 'Ingresso.com / Trailers API',
      refreshMinutes: 60,
      enabled: true,
      icon: Film,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      sample: 'Em cartaz: Duna Parte 2, Gladiador II, Divertida Mente 2',
    },
    {
      id: 'src-5',
      title: 'Dicas de Saúde & Bem-Estar',
      category: 'Saúde',
      provider: 'Ministério da Saúde & Nutrição Prática',
      refreshMinutes: 120,
      enabled: true,
      icon: HeartPulse,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      sample: 'Dica do Dia: Beba pelo menos 2 litros de água para manter o foco e hidratação.',
    },
  ]);

  const toggleSource = (id: string) => {
    setSources(prev =>
      prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  return (
    <div id="dynamic-content-root" className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-100 font-['Space_Grotesk']">
            Conteúdo Automático & Feeds em Tempo Real
          </h2>
          <p className="text-xs lg:text-sm text-slate-400">
            Mantenha as telas atualizadas com notícias, cotações e placares esportivos sem intervenção manual
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-md">
          <CheckCircle2 className="w-4 h-4" />
          <span>5 Conexões RSS/API Operacionais</span>
        </div>
      </div>

      {/* Grid of Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sources.map(source => {
          const Icon = source.icon;
          return (
            <div
              key={source.id}
              className="p-5 rounded-xl bg-[#121214] border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-lg border ${source.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <button
                    onClick={() => toggleSource(source.id)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                      source.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-[#18181b] text-slate-400 border border-slate-800'
                    }`}
                  >
                    {source.enabled ? 'ATIVADO' : 'DESATIVADO'}
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-['Space_Grotesk']">
                    {source.title}
                  </h3>
                  <p className="text-xs text-slate-400">Fonte: {source.provider}</p>
                </div>

                {/* Sample Live Snippet */}
                <div className="p-3 rounded-lg bg-[#0c0c0e] border border-slate-800 text-xs text-slate-300 italic">
                  "{source.sample}"
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Atualiza a cada {source.refreshMinutes} min</span>
                <span className="text-emerald-400 font-medium cursor-pointer hover:underline">
                  Configurar layout &gt;
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
