import React, { useState } from 'react';
import { Sliders, HardDrive, Shield, Palette, CheckCircle2, Save, Database, Radio, RefreshCw, ExternalLink } from 'lucide-react';
import { useSignage } from '../../context/SignageContext';

export const SettingsView: React.FC = () => {
  const {
    isSupabaseConnected,
    isSyncingWithSupabase,
    setIsSupabaseModalOpen,
    syncWithSupabase,
  } = useSignage();

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
            Parâmetros de cache offline, sincronização Supabase e comportamento dos terminais
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSupabaseModalOpen(true)}
            className="px-3.5 py-2 rounded-md bg-[#18181c] hover:bg-[#202026] text-slate-200 border border-slate-700 text-xs font-semibold shadow flex items-center gap-2 transition-all cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gerenciar Supabase</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            {saved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saved ? 'Configurações Salvas!' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>

      {/* Supabase Connection Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-[#121215] to-[#121215] border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Banco de Dados em Nuvem (PostgreSQL / Supabase)</h3>
              {isSupabaseConnected ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Radio className="w-2.5 h-2.5 animate-pulse" /> Conectado & Realtime Ativo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Modo Local
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isSupabaseConnected
                ? 'Todas as telas e mídias estão sincronizadas em tempo real via WebSockets do Supabase.'
                : 'Conecte suas credenciais do Supabase para sincronizar suas TVs e painéis instantaneamente.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          {isSupabaseConnected && (
            <button
              type="button"
              onClick={() => syncWithSupabase()}
              disabled={isSyncingWithSupabase}
              className="px-3.5 py-2 rounded-xl bg-[#1a1a20] hover:bg-[#222228] border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingWithSupabase ? 'animate-spin' : ''}`} />
              <span>Sincronizar Agora</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsSupabaseModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>{isSupabaseConnected ? 'Configurações de Sincronia' : 'Conectar Supabase'}</span>
          </button>
        </div>
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
