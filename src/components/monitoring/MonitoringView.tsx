import React, { useState } from 'react';
import { Tv, RotateCw, Power, Camera, HardDrive, Cpu, Activity, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSignage } from '../../context/SignageContext';

export const MonitoringView: React.FC = () => {
  const { screens, openPlayer, triggerRemoteSync, triggerRemoteReboot } = useSignage();
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  const handleRefreshAll = () => {
    setIsRefreshingAll(true);
    setTimeout(() => {
      setIsRefreshingAll(false);
    }, 1500);
  };

  return (
    <div id="monitoring-view-root" className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-100 font-['Space_Grotesk']">
            Video Wall & Monitoramento Remoto de Hardware
          </h2>
          <p className="text-xs lg:text-sm text-slate-400">
            Painel NOC com mosaico de screenshots ao vivo, telemetria de CPU/RAM e watchdog remoto
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefreshAll}
            className="px-4 py-2 rounded-md bg-[#18181b] hover:bg-[#202024] text-slate-200 text-xs font-medium flex items-center gap-2 border border-slate-800 transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isRefreshingAll ? 'Capturando Telas...' : 'Capturar Screenshots (Todas)'}</span>
          </button>
        </div>
      </div>

      {/* Video Wall Grid (All Screens live screenshots) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {screens.map(scr => {
          const isOnline = scr.status === 'online';
          const isSyncing = scr.status === 'syncing';

          return (
            <div
              key={scr.id}
              className="rounded-xl bg-[#121214] border border-slate-800 overflow-hidden space-y-2 group hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              {/* Screenshot Frame */}
              <div className="relative aspect-video bg-black overflow-hidden">
                <img
                  src={scr.screenshotUrl}
                  alt={scr.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Status Indicator */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-[10px] font-medium flex items-center gap-1.5 border border-slate-800/80">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOnline ? 'bg-emerald-400 animate-pulse' : isSyncing ? 'bg-amber-400' : 'bg-rose-500'
                    }`}
                  />
                  <span className="text-slate-100 font-mono">{scr.code}</span>
                </div>

                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openPlayer(scr.id, scr.currentPlaylistId)}
                    className="p-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg cursor-pointer transition-colors"
                    title="Abrir Player"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>

              {/* Specs & Health */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-100 truncate">{scr.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{scr.orientation}</span>
                </div>

                {/* Mini Telemetry Bar */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-[9px] text-slate-400 font-mono">
                  <div className="p-1 rounded-md bg-[#0c0c0e] border border-slate-800">
                    <span>CPU {scr.cpuUsage}%</span>
                  </div>
                  <div className="p-1 rounded-md bg-[#0c0c0e] border border-slate-800">
                    <span>RAM {scr.ramUsage}%</span>
                  </div>
                  <div className="p-1 rounded-md bg-[#0c0c0e] border border-slate-800 text-emerald-400">
                    <span>{scr.syncProgress}% OK</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Último ping: {scr.lastPing}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerRemoteSync(scr.id)}
                      className="hover:text-emerald-400 cursor-pointer"
                      title="Sincronizar"
                    >
                      <RotateCw className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => triggerRemoteReboot(scr.id)}
                      className="hover:text-rose-400 cursor-pointer"
                      title="Reiniciar"
                    >
                      <Power className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
