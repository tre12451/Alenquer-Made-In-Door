import React, { useState } from 'react';
import {
  Tv,
  Film,
  ListVideo,
  Clock,
  RotateCw,
  AlertTriangle,
  Play,
  ArrowUpRight,
  Wifi,
  WifiOff,
  Activity,
  Building2,
  HardDriveDownload,
  Sliders,
  CheckCircle2,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { useSignage } from '../../context/SignageContext';

export const DashboardView: React.FC = () => {
  const {
    screens,
    media,
    playlists,
    openPlayer,
    openConnectScreen,
    setShareModalScreen,
    setSelectedScreenForDetails,
    setActiveView,
    setIsAddScreenOpen,
  } = useSignage();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const onlineScreens = screens.filter(s => s.status === 'online').length;
  const offlineScreens = screens.filter(s => s.status === 'offline').length;
  const criticalCount = offlineScreens > 0 ? offlineScreens : 0;

  return (
    <div id="dashboard-view-root" className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* 1. Geometric Balance 4-Column Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total de Telas */}
        <div
          id="stat-total-screens"
          onClick={() => setActiveView('screens')}
          className="bg-[#121214] border border-slate-800 p-5 rounded-xl cursor-pointer hover:border-slate-700 transition-colors"
        >
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total de Telas</p>
          <p className="text-3xl font-bold mt-1 text-slate-100 font-['Space_Grotesk']">{screens.length}</p>
          <div className="flex items-center gap-2 mt-3 text-xs text-emerald-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span>{onlineScreens} Online</span>
          </div>
        </div>

        {/* Card 2: Campanhas Ativas */}
        <div
          id="stat-active-campaigns"
          onClick={() => setActiveView('playlists')}
          className="bg-[#121214] border border-slate-800 p-5 rounded-xl cursor-pointer hover:border-slate-700 transition-colors"
        >
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Campanhas Ativas</p>
          <p className="text-3xl font-bold mt-1 text-slate-100 font-['Space_Grotesk']">{playlists.length || 12}</p>
          <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full">
            <div className="h-full w-[70%] bg-indigo-500 rounded-full" />
          </div>
        </div>

        {/* Card 3: Cache Local Total */}
        <div className="bg-[#121214] border border-slate-800 p-5 rounded-xl">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Cache Local Total</p>
          <p className="text-3xl font-bold mt-1 text-slate-100 font-['Space_Grotesk']">
            4,8 <span className="text-lg font-normal text-slate-500">GB</span>
          </p>
          <p className="mt-3 text-xs text-slate-400">Sincronizado há 14min</p>
        </div>

        {/* Card 4: Alertas Críticos */}
        <div
          id="stat-critical-alerts"
          onClick={() => setActiveView('screens')}
          className="bg-rose-950/20 border border-rose-900/30 p-5 rounded-xl cursor-pointer hover:border-rose-800/50 transition-colors"
        >
          <p className="text-rose-500 text-xs font-medium uppercase tracking-wider">Alertas Críticos</p>
          <p className="text-3xl font-bold mt-1 text-rose-500 font-['Space_Grotesk']">
            {criticalCount < 10 ? `0${criticalCount}` : criticalCount}
          </p>
          <p className="mt-3 text-xs text-rose-400">Verificar Telas Offline</p>
        </div>
      </div>

      {/* 2. Real-Time Terminal Monitoring + Upcoming Queue Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Monitoramento em Tempo Real */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 font-['Space_Grotesk']">
              Monitoramento em Tempo Real
            </h2>
            <div className="flex gap-2 text-xs">
              <button
                id="btn-switch-grid-mode"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Grade
              </button>
              <button
                id="btn-switch-table-mode"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Lista
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {screens.slice(0, 4).map(screen => {
                const isOnline = screen.status === 'online';
                const isOffline = screen.status === 'offline';
                const isSyncing = screen.status === 'syncing';

                return (
                  <div
                    key={screen.id}
                    id={`live-preview-${screen.id}`}
                    onClick={() => setSelectedScreenForDetails(screen)}
                    className={`bg-[#121214] border border-slate-800 rounded-lg overflow-hidden flex flex-col group cursor-pointer hover:border-slate-700 transition-colors ${
                      isOffline ? 'opacity-70' : ''
                    }`}
                  >
                    <div className="relative h-28 bg-slate-900 flex items-center justify-center overflow-hidden">
                      {isOnline && (
                        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.5),transparent)]" />
                      )}
                      {isSyncing && (
                        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.5),transparent)]" />
                      )}

                      <div className="text-xs font-mono text-slate-400 z-10 uppercase text-center px-4">
                        {isOffline ? (
                          <span className="text-rose-500 font-bold">SEM CONEXÃO</span>
                        ) : isSyncing ? (
                          <span className="text-amber-400">[ ATUALIZANDO_OS... ]</span>
                        ) : (
                          `[ ${screen.currentMediaTitle || 'PROMOÇÃO_VERÃO.MP4'} ]`
                        )}
                      </div>

                      {/* Status indicator pip */}
                      {isOnline && (
                        <div className="absolute top-2.5 left-2.5 bg-emerald-500 w-2 h-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      )}
                      {isOffline && (
                        <div className="absolute top-2.5 left-2.5 bg-rose-500 w-2 h-2 rounded-full" />
                      )}
                      {isSyncing && (
                        <div className="absolute top-2.5 left-2.5 bg-amber-500 w-2 h-2 rounded-full animate-pulse" />
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPlayer(screen.id, screen.currentPlaylistId);
                        }}
                        className="absolute bottom-2 right-2 px-2 py-1 rounded bg-slate-800/90 hover:bg-emerald-600 text-[10px] text-slate-200 hover:text-white font-medium flex items-center gap-1 transition-colors"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Ver TV</span>
                      </button>
                    </div>

                    <div className="p-3 flex justify-between items-center bg-[#121214]">
                      <div className="text-sm text-slate-200 truncate">
                        <b>{screen.name}</b>
                        <span className="text-slate-500 ml-2 text-xs truncate">
                          - {screen.branchName}
                        </span>
                      </div>
                      <div className="text-[10px] bg-slate-800 px-2 py-0.5 rounded uppercase font-semibold text-slate-400 shrink-0">
                        {screen.orientation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#121214] border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0c0c0e] text-slate-500 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Terminal</th>
                    <th className="py-3 px-4">Local</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Player</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {screens.map(scr => (
                    <tr key={scr.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-slate-100">{scr.name}</td>
                      <td className="py-3 px-4 text-slate-400">{scr.branchName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            scr.status === 'online'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : scr.status === 'syncing'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {scr.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-dash-share-${scr.id}`}
                            onClick={() => setShareModalScreen(scr)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                            title="Compartilhar Link / Conectar TV"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-dash-open-${scr.id}`}
                            onClick={() => openPlayer(scr.id, scr.currentPlaylistId)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                            title="Abrir em Nova Guia"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>NOVA GUIA</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 1 Column: Próximas na Fila + Sincronização Ativa */}
        <div className="flex flex-col space-y-4">
          <h2 className="text-lg font-bold text-slate-100 font-['Space_Grotesk']">
            Próximas na Fila
          </h2>
          <div className="bg-[#121214] border border-slate-800 rounded-xl flex-1 p-5 space-y-4 overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              {/* Queue item 1 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-md overflow-hidden flex items-center justify-center text-[9px] font-bold text-slate-300 shrink-0">
                  PDF
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">Cardápio de Almoço</p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wide">01/10 • 12:00 às 14:00</p>
                </div>
                <div className="text-indigo-400 font-bold text-xs">12:00</div>
              </div>

              <div className="h-px bg-slate-800" />

              {/* Queue item 2 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-md overflow-hidden flex items-center justify-center text-[9px] font-bold text-slate-300 shrink-0">
                  VÍDEO
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">Trailer Marvel Promo</p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wide">Segunda a Sexta • 15s</p>
                </div>
                <div className="text-slate-400 font-bold text-xs">14:00</div>
              </div>

              <div className="h-px bg-slate-800" />

              {/* Queue item 3 */}
              <div className="flex items-center gap-3 opacity-60">
                <div className="w-10 h-10 bg-slate-800 rounded-md overflow-hidden flex items-center justify-center text-[9px] font-bold text-slate-300 shrink-0">
                  RSS
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">Widget Notícias G1</p>
                  <p className="text-[11px] text-slate-500 uppercase tracking-wide">Atualização Realtime</p>
                </div>
                <div className="text-slate-500 font-bold text-xs">14:01</div>
              </div>
            </div>

            {/* Sincronização Ativa Bar */}
            <div className="mt-4 p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-lg">
              <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                Sincronização Ativa
              </p>
              <p className="text-xs mt-1 text-slate-300">
                Transferindo: <b className="text-white">campanha_natal.mp4</b> (85%)
              </p>
              <div className="mt-2 h-1.5 w-full bg-indigo-950 rounded-full overflow-hidden">
                <div className="h-full w-[85%] bg-indigo-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Availability Chart & Branch Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Network Health / Uptime Timeline Chart */}
        <div className="lg:col-span-8 rounded-xl bg-[#121214] border border-slate-800 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-['Space_Grotesk']">
                Disponibilidade da Rede de Telas (Últimas 24 Horas)
              </h3>
              <p className="text-xs text-slate-400">
                Taxa de conexão e atividade contínua dos players nos pontos de venda
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                98.4% Uptime Médio
              </span>
            </div>
          </div>

          {/* SVG Uptime Graph */}
          <div className="h-40 w-full pt-4">
            <svg className="w-full h-full" viewBox="0 0 600 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="onlineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="600" y2="30" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="75" x2="600" y2="75" stroke="#1e293b" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#1e293b" strokeDasharray="4 4" />

              {/* Filled Area */}
              <path
                d="M 0,40 Q 80,35 150,45 T 300,30 T 450,48 T 520,38 L 600,32 L 600,150 L 0,150 Z"
                fill="url(#onlineGradient)"
              />
              {/* Line */}
              <path
                d="M 0,40 Q 80,35 150,45 T 300,30 T 450,48 T 520,38 L 600,32"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
              />

              {/* Data points */}
              {[
                { cx: 150, cy: 45 },
                { cx: 300, cy: 30 },
                { cx: 450, cy: 48 },
                { cx: 600, cy: 32 },
              ].map((pt, i) => (
                <circle key={i} cx={pt.cx} cy={pt.cy} r="3.5" fill="#818cf8" stroke="#09090b" strokeWidth="2" />
              ))}
            </svg>
            <div className="flex justify-between text-[10px] text-slate-500 pt-2 font-mono">
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00 (Abertura)</span>
              <span>12:00 (Pico)</span>
              <span>16:00</span>
              <span>20:00</span>
              <span>Agora</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-center">
            <div className="p-3 rounded-lg bg-[#0c0c0e] border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Exibições Hoje</span>
              <p className="text-base font-bold text-slate-100 font-['Space_Grotesk']">14.820 mídias</p>
            </div>
            <div className="p-3 rounded-lg bg-[#0c0c0e] border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Volume de Cache</span>
              <p className="text-base font-bold text-cyan-400 font-['Space_Grotesk']">4,8 GB / TV</p>
            </div>
            <div className="p-3 rounded-lg bg-[#0c0c0e] border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Taxa de Falhas</span>
              <p className="text-base font-bold text-emerald-400 font-['Space_Grotesk']">0.02% (Watchdog)</p>
            </div>
          </div>
        </div>

        {/* Units / Branches Summary Breakdown */}
        <div className="lg:col-span-4 rounded-xl bg-[#121214] border border-slate-800 p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100 font-['Space_Grotesk']">Visão por Filial</h3>
              </div>
              <button
                id="btn-goto-branches"
                onClick={() => setActiveView('branches')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5"
              >
                <span>Ver todas</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 pt-3">
              {[
                { name: 'Loja Centro (Hipermercado)', screens: '3/4 online', pct: 75, color: 'bg-emerald-500' },
                { name: 'Matriz Corporativa', screens: '3/3 online', pct: 100, color: 'bg-emerald-500' },
                { name: 'Shopping Morumbi Totens', screens: '1/2 online', pct: 50, color: 'bg-amber-500' },
                { name: 'Loja Zona Norte', screens: '1/3 online', pct: 33, color: 'bg-rose-500' },
              ].map((branch, i) => (
                <div key={i} className="p-3 rounded-lg bg-[#0c0c0e] border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 truncate">{branch.name}</span>
                    <span className="font-mono text-slate-400 shrink-0">{branch.screens}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`${branch.color} h-full rounded-full`} style={{ width: `${branch.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
            <span className="font-medium">Cadastrar nova tela / TV?</span>
            <button
              id="btn-goto-pairing-screen"
              onClick={() => openConnectScreen()}
              className="font-bold text-white hover:text-emerald-200 underline cursor-pointer"
            >
              CONECTAR TELA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
