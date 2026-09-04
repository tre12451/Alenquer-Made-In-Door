import React, { useState } from 'react';
import {
  Tv,
  Plus,
  Play,
  RotateCw,
  Power,
  Volume2,
  Sliders,
  Maximize2,
  HardDriveDownload,
  Cpu,
  Thermometer,
  Wifi,
  WifiOff,
  Filter,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  MoreVertical,
  QrCode,
  Smartphone,
  ExternalLink,
  Trash2,
  X,
  Share2,
  Copy,
  Globe,
} from 'lucide-react';
import { useSignage } from '../../context/SignageContext';
import { ScreenDevice, ScreenOrientation } from '../../types';
import { getScreenSlug } from '../../lib/slug';

export const ScreensView: React.FC = () => {
  const {
    screens,
    playlists,
    branches,
    openPlayer,
    openConnectScreen,
    openConnectModalWithCode,
    setShareModalScreen,
    copyPlayerLink,
    isAddScreenOpen,
    setIsAddScreenOpen,
    addScreen,
    updateScreen,
    deleteScreen,
    triggerRemoteSync,
    triggerRemoteReboot,
    selectedScreenForDetails,
    setSelectedScreenForDetails,
  } = useSignage();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [screenToDelete, setScreenToDelete] = useState<ScreenDevice | null>(null);

  // Add Screen Modal form state
  const [newScreenName, setNewScreenName] = useState('');
  const [newScreenBranch, setNewScreenBranch] = useState('b-centro');
  const [newScreenEnv, setNewScreenEnv] = useState('Entrada Principal');
  const [newScreenOrientation, setNewScreenOrientation] = useState<ScreenOrientation>('16:9');
  const [pairingCodeInput, setPairingCodeInput] = useState(`MH-${Math.floor(1000 + Math.random() * 9000)}`);

  // Filter logic
  const filteredScreens = screens.filter(scr => {
    if (filterStatus !== 'all' && scr.status !== filterStatus) return false;
    if (filterBranch !== 'all' && scr.branchId !== filterBranch) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        scr.name.toLowerCase().includes(q) ||
        scr.code.toLowerCase().includes(q) ||
        scr.environment.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateScreenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const branchObj = branches.find(b => b.id === newScreenBranch);
    addScreen({
      name: newScreenName || `TV Nova ${pairingCodeInput}`,
      code: pairingCodeInput,
      branchId: newScreenBranch,
      branchName: branchObj?.name || 'Loja Centro',
      environment: newScreenEnv,
      orientation: newScreenOrientation,
    });
    setIsAddScreenOpen(false);
    setNewScreenName('');
  };

  return (
    <div id="screens-view-root" className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-100 font-['Space_Grotesk']">
            Gerenciamento de Telas & Players
          </h2>
          <p className="text-xs lg:text-sm text-slate-400">
            Configure parâmetros, monitore a reprodução e controle remotamente as TVs da sua rede
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            id="btn-connect-screen-trigger"
            onClick={() => openConnectModalWithCode()}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-md shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            title="Conectar tela pelo código PIN ou lendo QR Code e vincular playlist com reprodução imediata"
          >
            <Tv className="w-4 h-4" />
            <span>CONECTAR NOVA TELA</span>
          </button>

          <button
            id="btn-open-terminal-tab"
            onClick={() => openConnectScreen()}
            className="hidden sm:flex px-3 py-2 bg-[#18181c] hover:bg-[#202026] text-slate-300 border border-slate-800 text-xs font-medium rounded-md items-center gap-1.5 transition-colors cursor-pointer"
            title="Abrir tela de pareamento / TV em nova guia para gerar código PIN"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gerar Código na TV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3.5 rounded-xl bg-[#121214] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Status Filter Buttons */}
          {[
            { id: 'all', label: 'Todas', count: screens.length },
            { id: 'online', label: 'Online', count: screens.filter(s => s.status === 'online').length },
            { id: 'syncing', label: 'Sincronizando', count: screens.filter(s => s.status === 'syncing').length },
            { id: 'offline', label: 'Offline', count: screens.filter(s => s.status === 'offline').length },
          ].map(f => (
            <button
              key={f.id}
              id={`filter-status-${f.id}`}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterStatus === f.id
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Branch Filter */}
          <select
            id="select-branch-filter"
            value={filterBranch}
            onChange={e => setFilterBranch(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-[#18181b] border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-slate-600"
          >
            <option value="all">Todas as Filiais</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <input
            id="input-search-screens"
            type="text"
            placeholder="Buscar por nome, código..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-[#18181b] border border-slate-800 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-slate-600 w-full sm:w-48"
          />
        </div>
      </div>

      {/* Grid of Screen Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredScreens.map(scr => {
          const isOnline = scr.status === 'online';
          const isSyncing = scr.status === 'syncing';
          const isOffline = scr.status === 'offline';

          return (
            <div
              key={scr.id}
              id={`screen-card-${scr.id}`}
              className="rounded-xl bg-[#121214] border border-slate-800 overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm"
            >
              {/* Card Media Preview Header */}
              <div className="relative h-44 bg-slate-950 overflow-hidden">
                <img
                  src={scr.screenshotUrl}
                  alt={scr.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />

                {/* Status Badge */}
                <div className="absolute top-3 left-3 z-10">
                  {isOnline && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#09090b]/80 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                      ONLINE
                    </span>
                  )}
                  {isSyncing && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#09090b]/80 text-amber-400 border border-amber-500/30 backdrop-blur-md">
                      <RotateCw className="w-3 h-3 animate-spin text-amber-400" />
                      SINCRONIZANDO
                    </span>
                  )}
                  {isOffline && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#09090b]/80 text-rose-400 border border-rose-500/30 backdrop-blur-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      OFFLINE
                    </span>
                  )}
                </div>

                {/* Orientation & Code */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-slate-300 font-mono text-[10px] font-semibold">
                    {scr.orientation}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-cyan-300 font-mono text-[10px] font-bold">
                    {scr.code}
                  </span>
                </div>

                {/* Bottom Overlay Title */}
                <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-[#0c0c0e] via-[#0c0c0e]/80 to-transparent p-3 pt-6">
                  <p className="text-xs font-bold text-slate-100 truncate">{scr.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{scr.environment} • {scr.branchName}</p>
                </div>
              </div>

              {/* Card Body Info */}
              <div className="p-4 space-y-3.5 flex-1">
                {/* Current Playback */}
                <div className="p-2.5 rounded-lg bg-[#0c0c0e] border border-slate-800/80 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">
                    Playlist Ativa
                  </span>
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {scr.currentPlaylistName}
                  </p>
                  <p className="text-[11px] text-slate-400 italic truncate">
                    Mídia: "{scr.currentMediaTitle}"
                  </p>
                </div>

                {/* Telemetry & Cache bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <HardDriveDownload className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Cache Local</span>
                    </div>
                    <span className="font-mono text-slate-300">
                      {(scr.cacheUsedMB / 1024).toFixed(1)} GB / {(scr.cacheTotalMB / 1024).toFixed(0)} GB ({scr.syncProgress}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        scr.syncProgress === 100 ? 'bg-cyan-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${scr.syncProgress}%` }}
                    />
                  </div>
                </div>

                {/* Direct Player URL Pill (login.com.br/nomedatela) */}
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#0c0c0e] border border-slate-800/80 text-[11px] font-mono text-emerald-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">login.com.br/{getScreenSlug(scr)}</span>
                  </div>
                  <button
                    id={`btn-copy-slug-card-${scr.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyPlayerLink(scr.id, scr.currentPlaylistId);
                    }}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-300 transition-colors shrink-0 ml-1 cursor-pointer"
                    title="Copiar link oficial do player (login.com.br/...)"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>

                {/* Hardware telemetry chips */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px] text-slate-400 font-mono">
                  <div className="p-1.5 rounded-md bg-[#0c0c0e] border border-slate-800/60">
                    <span>CPU: {scr.cpuUsage}%</span>
                  </div>
                  <div className="p-1.5 rounded-md bg-[#0c0c0e] border border-slate-800/60">
                    <span>RAM: {scr.ramUsage}%</span>
                  </div>
                  <div className="p-1.5 rounded-md bg-[#0c0c0e] border border-slate-800/60">
                    <span>{scr.temperature > 0 ? `${scr.temperature}°C` : 'N/D'}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-[#0c0c0e] border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    id={`btn-screen-reboot-${scr.id}`}
                    onClick={() => triggerRemoteReboot(scr.id)}
                    className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
                    title="Reiniciar player remotamente"
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    id={`btn-screen-sync-${scr.id}`}
                    onClick={() => triggerRemoteSync(scr.id)}
                    className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                    title="Forçar sincronização de mídia"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    id={`btn-screen-details-drawer-${scr.id}`}
                    onClick={() => setSelectedScreenForDetails(scr)}
                    className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
                    title="Ver detalhes da tela"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                  <button
                    id={`btn-card-share-player-${scr.id}`}
                    onClick={() => setShareModalScreen(scr)}
                    className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                    title="Compartilhar link do player para TV ou outro dispositivo"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    id={`btn-card-delete-screen-${scr.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setScreenToDelete(scr);
                    }}
                    className="p-1.5 rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Excluir tela da rede"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Primary CTA: ABRIR EM NOVA GUIA */}
                <button
                  id={`btn-card-open-player-${scr.id}`}
                  onClick={() => openPlayer(scr.id, scr.currentPlaylistId)}
                  className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title="Abrir player desta tela em uma nova guia"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>NOVA GUIA</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Screen Details Modal / Drawer */}
      {selectedScreenForDetails && (
        <div
          id="modal-screen-details-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-[#121214] border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  Detalhes do Player Remoto
                </span>
                <h3 className="text-xl font-bold text-slate-100 font-['Space_Grotesk']">
                  {selectedScreenForDetails.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Código PIN: <span className="text-cyan-400 font-mono font-bold">{selectedScreenForDetails.code}</span> • {selectedScreenForDetails.environment}
                </p>
              </div>
              <button
                id="btn-close-screen-details"
                onClick={() => setSelectedScreenForDetails(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Screenshot Preview */}
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black h-48">
              <img
                src={selectedScreenForDetails.screenshotUrl}
                alt="Screenshot ao vivo"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] text-emerald-400 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span>Screenshot Capturada (Atualizada há 12s)</span>
              </div>
            </div>

            {/* Hardware & Network Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#0c0c0e] border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Resolução</span>
                <p className="font-bold text-slate-200">{selectedScreenForDetails.resolution}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#0c0c0e] border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Sistema Operacional</span>
                <p className="font-bold text-slate-200 truncate">{selectedScreenForDetails.os}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#0c0c0e] border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">IP Address</span>
                <p className="font-bold text-slate-200 font-mono">{selectedScreenForDetails.ipAddress}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#0c0c0e] border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Versão Player</span>
                <p className="font-bold text-indigo-400 font-mono">{selectedScreenForDetails.playerVersion}</p>
              </div>
            </div>

            {/* Playback Settings (Volume, Playlist, Orientation) */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Configurações da Tela
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Playlist Associada
                  </label>
                  <select
                    id="select-detail-playlist"
                    value={selectedScreenForDetails.currentPlaylistId}
                    onChange={e => {
                      const pl = playlists.find(p => p.id === e.target.value);
                      updateScreen(selectedScreenForDetails.id, {
                        currentPlaylistId: e.target.value,
                        currentPlaylistName: pl?.name || '',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-slate-600"
                  >
                    {playlists.map(pl => (
                      <option key={pl.id} value={pl.id}>
                        {pl.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Slug / Player URL Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Página de Acesso ao Player</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">login.com.br/nomedatela</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500 select-none">login.com.br/</span>
                    <input
                      id="input-detail-screen-slug"
                      type="text"
                      value={selectedScreenForDetails.slug || ''}
                      onChange={e =>
                        updateScreen(selectedScreenForDetails.id, {
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
                        })
                      }
                      placeholder="nomedatela"
                      className="flex-1 px-3 py-1.5 rounded-md bg-[#18181b] border border-slate-700 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      id="btn-copy-slug-from-detail"
                      type="button"
                      onClick={() => copyPlayerLink(selectedScreenForDetails.id, selectedScreenForDetails.currentPlaylistId)}
                      className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center justify-center cursor-pointer"
                      title="Copiar link oficial do player"
                    >
                      <Copy className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Orientação da Tela
                  </label>
                  <select
                    id="select-detail-orientation"
                    value={selectedScreenForDetails.orientation}
                    onChange={e =>
                      updateScreen(selectedScreenForDetails.id, {
                        orientation: e.target.value as ScreenOrientation,
                      })
                    }
                    className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-slate-600"
                  >
                    <option value="16:9">Horizontal 16:9 (Padrão)</option>
                    <option value="9:16">Vertical 9:16 (Totem)</option>
                    <option value="4:3">4:3 (Monitores Legados)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Volume do Player: {selectedScreenForDetails.volume}%
                  </label>
                  <input
                    id="range-detail-volume"
                    type="range"
                    min="0"
                    max="100"
                    value={selectedScreenForDetails.volume}
                    onChange={e =>
                      updateScreen(selectedScreenForDetails.id, { volume: Number(e.target.value) })
                    }
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Horário de Funcionamento
                  </label>
                  <div className="flex items-center gap-2 text-xs text-slate-200">
                    <input
                      type="time"
                      defaultValue={selectedScreenForDetails.operatingHours.start}
                      className="px-2 py-1.5 rounded-md bg-[#18181b] border border-slate-800 text-slate-100"
                    />
                    <span>até</span>
                    <input
                      type="time"
                      defaultValue={selectedScreenForDetails.operatingHours.end}
                      className="px-2 py-1.5 rounded-md bg-[#18181b] border border-slate-800 text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                id="btn-delete-screen"
                onClick={() => {
                  setScreenToDelete(selectedScreenForDetails);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5 cursor-pointer py-1.5 px-2.5 rounded-md hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Tela</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-copy-link-from-modal"
                  onClick={() => copyPlayerLink(selectedScreenForDetails.id, selectedScreenForDetails.currentPlaylistId)}
                  className="px-3 py-1.5 rounded-md bg-[#18181b] hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  title="Copiar link direto para área de transferência"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copiar Link</span>
                </button>

                <button
                  id="btn-share-from-modal"
                  onClick={() => {
                    const scr = selectedScreenForDetails;
                    setSelectedScreenForDetails(null);
                    setShareModalScreen(scr);
                  }}
                  className="px-3 py-1.5 rounded-md bg-[#18181b] hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  title="Abrir tela de compartilhamento com QR Code"
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Compartilhar / TV</span>
                </button>

                <button
                  id="btn-sync-from-modal"
                  onClick={() => triggerRemoteSync(selectedScreenForDetails.id)}
                  className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                >
                  Forçar Sincronização
                </button>

                <button
                  id="btn-open-player-from-modal"
                  onClick={() => {
                    openPlayer(selectedScreenForDetails.id, selectedScreenForDetails.currentPlaylistId);
                    setSelectedScreenForDetails(null);
                  }}
                  className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/20"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir em Nova Guia</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Pair Screen Modal */}
      {isAddScreenOpen && (
        <div
          id="modal-add-screen-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-[#121214] border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-['Space_Grotesk']">
                  Conectar Nova Tela / TV
                </h3>
                <p className="text-xs text-slate-400">
                  Informe o código de conexão exibido na tela ou no QR Code
                </p>
              </div>
              <button
                id="btn-close-add-screen"
                onClick={() => setIsAddScreenOpen(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateScreenSubmit} className="space-y-4">
              {/* Pairing PIN */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Código de Pareamento de 6 Dígitos
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="input-pairing-code"
                    type="text"
                    required
                    value={pairingCodeInput}
                    onChange={e => setPairingCodeInput(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-cyan-300 font-mono font-bold text-center tracking-widest text-lg focus:outline-none focus:border-slate-600"
                    placeholder="MH-9021"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Abra o aplicativo Media Hub na TV para ver este código, ou use o código gerado acima para testes.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome Amigável da Tela
                </label>
                <input
                  id="input-new-screen-name"
                  type="text"
                  required
                  placeholder="Ex: TV 11 — Entrada Hortifrúti"
                  value={newScreenName}
                  onChange={e => setNewScreenName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Filial / Unidade
                  </label>
                  <select
                    id="select-new-screen-branch"
                    value={newScreenBranch}
                    onChange={e => setNewScreenBranch(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 text-xs"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Orientação
                  </label>
                  <select
                    id="select-new-screen-orientation"
                    value={newScreenOrientation}
                    onChange={e => setNewScreenOrientation(e.target.value as ScreenOrientation)}
                    className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 text-xs"
                  >
                    <option value="16:9">16:9 Horizontal (TV Padrão)</option>
                    <option value="9:16">9:16 Vertical (Totem)</option>
                    <option value="4:3">4:3 Retangular</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ambiente / Ponto de Instalação
                </label>
                <input
                  id="input-new-screen-env"
                  type="text"
                  placeholder="Ex: Setor de Carnes, Caixas 1-4, Recepção"
                  value={newScreenEnv}
                  onChange={e => setNewScreenEnv(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  id="btn-cancel-add-screen"
                  onClick={() => setIsAddScreenOpen(false)}
                  className="px-4 py-2 rounded-md text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-submit-add-screen"
                  className="px-5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md cursor-pointer"
                >
                  Conectar e Ativar Tela
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão no Próprio App (NÃO USA ALERT DO NAVEGADOR) */}
      {screenToDelete && (
        <div
          id="modal-confirm-delete-screen"
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setScreenToDelete(null)}
        >
          <div
            className="bg-[#121214] border border-rose-900/40 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Header de Exclusão */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-lg font-bold text-slate-100 font-['Space_Grotesk']">
                  Excluir Tela Definitivamente?
                </h3>
                <p className="text-xs text-slate-400">
                  Esta ação desvinculará a tela do sistema e interromperá a exibição.
                </p>
              </div>
              <button
                type="button"
                id="btn-close-delete-modal-x"
                onClick={() => setScreenToDelete(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Informações da Tela Selecionada */}
            <div className="p-3.5 rounded-xl bg-[#18181b] border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Nome:</span>
                <span className="font-semibold text-white truncate max-w-[220px]">
                  {screenToDelete.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Código PIN:</span>
                <span className="font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                  {screenToDelete.code}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Localização:</span>
                <span className="text-slate-300">
                  {screenToDelete.environment} • {screenToDelete.branchName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Endereço Player:</span>
                <span className="font-mono text-emerald-400">
                  login.com.br/{getScreenSlug(screenToDelete)}
                </span>
              </div>
            </div>

            {/* Alerta explicativo */}
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-[11px] text-rose-300 leading-relaxed flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>
                Para reconectar este terminal no futuro, será necessário cadastrar o código de pareamento novamente.
              </span>
            </div>

            {/* Botões do próprio App */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                id="btn-cancel-delete-screen"
                onClick={() => setScreenToDelete(null)}
                className="px-4 py-2.5 rounded-lg bg-[#1c1c20] hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirm-delete-screen"
                onClick={() => {
                  deleteScreen(screenToDelete.id);
                  if (selectedScreenForDetails?.id === screenToDelete.id) {
                    setSelectedScreenForDetails(null);
                  }
                  setScreenToDelete(null);
                }}
                className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/40 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir Tela</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
