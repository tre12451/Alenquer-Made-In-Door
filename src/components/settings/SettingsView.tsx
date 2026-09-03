import React, { useState } from 'react';
import { Sliders, HardDrive, Shield, Palette, CheckCircle2, Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [cacheLimit, setCacheLimit] = useState('16');
  const [heartbeat, setHeartbeat] = useState('30');
  const [autoStart, setAutoStart] = useState(true);
  const [autoPurge, setAutoPurge] = useState(true);
  const [resolution, setResolution] = useState('4k');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div id="settings-view-root" className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-100 font-['Space_Grotesk']">
            Configurações Globais do Player & Sistema
          </h2>
          <p className="text-xs lg:text-sm text-slate-400">
            Parâmetros de cache offline, watchdog de reinicialização e comportamento dos terminais
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          {saved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saved ? 'Configurações Salvas!' : 'Salvar Alterações'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Armazenamento Local & Cache Offline */}
        <div className="p-6 rounded-xl bg-[#121214] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <HardDrive className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-100 font-['Space_Grotesk']">
              Cache Offline & Armazenamento
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Limite Máximo de Cache por Terminal (GB)
              </label>
              <select
                value={cacheLimit}
                onChange={e => setCacheLimit(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 focus:outline-none focus:border-slate-600"
              >
                <option value="8">8 GB (TVs Básicas / Sticks HDMI)</option>
                <option value="16">16 GB (Recomendado - 4K e Vídeos)</option>
                <option value="32">32 GB (Grande acervo offline)</option>
                <option value="64">64 GB (Mini PCs dedicados)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="check-auto-purge"
                checked={autoPurge}
                onChange={e => setAutoPurge(e.target.checked)}
                className="rounded bg-[#18181b] border-slate-800 text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="check-auto-purge" className="text-slate-300 cursor-pointer">
                Excluir automaticamente vídeos e banners expirados da memória local
              </label>
            </div>
          </div>
        </div>

        {/* 2. Watchdog & Heartbeat */}
        <div className="p-6 rounded-xl bg-[#121214] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Shield className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-100 font-['Space_Grotesk']">
              Watchdog & Heartbeat Remoto
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Intervalo de Ping do Player para a Nuvem
              </label>
              <select
                value={heartbeat}
                onChange={e => setHeartbeat(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 focus:outline-none focus:border-slate-600"
              >
                <option value="15">A cada 15 segundos (Tempo real)</option>
                <option value="30">A cada 30 segundos (Padrão)</option>
                <option value="60">A cada 60 segundos (Economia de banda)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="check-auto-start"
                checked={autoStart}
                onChange={e => setAutoStart(e.target.checked)}
                className="rounded bg-[#18181b] border-slate-800 text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="check-auto-start" className="text-slate-300 cursor-pointer">
                Inicialização automática em tela cheia ao ligar a TV (Boot Auto-Play)
              </label>
            </div>
          </div>
        </div>

        {/* 3. Resolução & Qualidade */}
        <div className="p-6 rounded-xl bg-[#121214] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sliders className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-100 font-['Space_Grotesk']">
              Resolução Padrão do Player
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Resolução de Renderização
              </label>
              <select
                value={resolution}
                onChange={e => setResolution(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 focus:outline-none focus:border-slate-600"
              >
                <option value="4k">4K Ultra HD (3840x2160) - Máxima nitidez</option>
                <option value="1080p">Full HD (1920x1080) - Padrão de mercado</option>
                <option value="720p">HD (1280x720) - Menor consumo de banda</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Marca & Logotipo */}
        <div className="p-6 rounded-xl bg-[#121214] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-purple-400">
            <Palette className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-100 font-['Space_Grotesk']">
              Identidade Visual & Marca
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Nome da Organização no Painel
              </label>
              <input
                type="text"
                defaultValue="Rede Floriano Supermercados"
                className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 focus:outline-none focus:border-slate-600"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
