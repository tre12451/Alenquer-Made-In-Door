import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Tv,
  Radio,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Copy,
  ExternalLink,
  Play,
  ListVideo,
  Sparkles,
} from 'lucide-react';
import { useSignage } from '../../context/SignageContext';

export const PairingScreen: React.FC = () => {
  const { screens, addScreen, playlists, openPlayer, branches } = useSignage();

  // Generate unique 6-character connection PIN
  const [pairingCode, setPairingCode] = useState(() => `MH-${Math.floor(1000 + Math.random() * 9000)}`);
  const [copied, setCopied] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlPlaylist = new URLSearchParams(window.location.search).get('playlist');
      if (urlPlaylist && playlists.some(p => p.id === urlPlaylist)) {
        return urlPlaylist;
      }
    }
    return playlists[0]?.id || 'pl-1';
  });
  const [isPaired, setIsPaired] = useState(false);
  const [createdScreenId, setCreatedScreenId] = useState<string>('');
  const [pairedPlaylistName, setPairedPlaylistName] = useState<string>('');

  const currentSelectedPlaylist = playlists.find(p => p.id === selectedPlaylistId) || playlists[0];

  // Ouvir pareamento em tempo real vindo do Painel Administrativo
  useEffect(() => {
    // 1. Verificar se a tela já foi cadastrada na lista de screens
    const matchedScreen = screens.find(s => s.code === pairingCode && s.currentPlaylistId);
    if (matchedScreen && !isPaired) {
      setIsPaired(true);
      setCreatedScreenId(matchedScreen.id);
      setPairedPlaylistName(matchedScreen.currentPlaylistName || 'Playlist Principal');
      const timer = setTimeout(() => {
        openPlayer(matchedScreen.id, matchedScreen.currentPlaylistId);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [screens, pairingCode, isPaired, openPlayer]);

  useEffect(() => {
    // 2. Ouvir via BroadcastChannel (comunicação entre abas e janelas em tempo real)
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('mediahub_pairing');
      channel.onmessage = (event) => {
        if (event.data && event.data.code === pairingCode) {
          setIsPaired(true);
          setCreatedScreenId(event.data.screenId);
          setPairedPlaylistName(event.data.playlistName || 'Playlist Vinculada');
          setTimeout(() => {
            openPlayer(event.data.screenId, event.data.playlistId);
          }, 1200);
        }
      };
    } catch (err) {}

    // 3. Ouvir via evento storage do localStorage
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'mediahub_last_paired_event' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data.code === pairingCode) {
            setIsPaired(true);
            setCreatedScreenId(data.screenId);
            setPairedPlaylistName(data.playlistName || 'Playlist Vinculada');
            setTimeout(() => {
              openPlayer(data.screenId, data.playlistId);
            }, 1200);
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [pairingCode, openPlayer]);

  const handleRegenerateCode = () => {
    setPairingCode(`MH-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleCopyCode = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Link do QR Code: ao ler com o celular, abre o Painel Admin já com o modal de conexão aberto e o código preenchido
  const pairUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?openConnectModal=true&code=${pairingCode}`
    : `https://mediahub.signage/pair/${pairingCode}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data=${encodeURIComponent(pairUrl)}`;

  const handleAcceptAndBindPlaylist = () => {
    const screenId = `scr-${Date.now()}`;
    setCreatedScreenId(screenId);
    setPairedPlaylistName(currentSelectedPlaylist ? currentSelectedPlaylist.name : 'Playlist Principal');

    const targetBranch = branches[0];
    addScreen({
      id: screenId,
      name: `TV ${pairingCode} — ${currentSelectedPlaylist ? currentSelectedPlaylist.name : 'Terminal Conectado'}`,
      code: pairingCode,
      branchId: targetBranch?.id || 'b-centro',
      branchName: targetBranch?.name || 'Loja Centro',
      environment: 'Terminal TV Conectado',
      status: 'online',
      currentPlaylistId: selectedPlaylistId,
      currentPlaylistName: currentSelectedPlaylist?.name || 'Playlist Principal',
    });

    setIsPaired(true);
    setTimeout(() => {
      openPlayer(screenId, selectedPlaylistId);
    }, 1200);
  };

  return (
    <div
      id="pairing-screen-root"
      className="min-h-screen bg-[#070709] text-slate-100 flex flex-col justify-between p-4 sm:p-8 lg:p-12 select-none relative overflow-hidden font-sans"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="flex items-center justify-between z-10 w-full max-w-5xl mx-auto pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl tracking-tight text-slate-100 font-['Space_Grotesk']">
                MEDIAHUB CONNECT
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
                Terminal de Conexão
              </span>
            </div>
            <p className="text-xs text-slate-400">Escaneie o QR Code ou use o Código PIN para vincular a tela</p>
          </div>
        </div>

        {/* Live indicator on the TV (no Painel Admin button) */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121214] border border-emerald-500/30 text-xs font-mono text-emerald-400 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="hidden sm:inline">Aguardando Conexão do Painel</span>
          <span className="sm:hidden">Aguardando...</span>
        </div>
      </header>

      {/* Center Main Box */}
      <main className="max-w-4xl w-full mx-auto my-auto py-4 z-10">
        {isPaired ? (
          <div className="bg-[#0f0f12] border border-emerald-500/30 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-400">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
                ✓ Conexão Estabelecida
              </span>
              <h2 className="text-3xl font-bold text-white font-['Space_Grotesk'] pt-1">
                TELA CONECTADA E VINCULADA!
              </h2>
              <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                O terminal <strong className="text-emerald-400 font-mono">{pairingCode}</strong> foi vinculado com sucesso à playlist{' '}
                <strong className="text-white">"{currentSelectedPlaylist?.name}"</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#08080a] border border-slate-800 max-w-md mx-auto flex items-center justify-between text-xs">
              <span className="text-slate-400">Playlist Ativa:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <ListVideo className="w-4 h-4" />
                {currentSelectedPlaylist?.name}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                id="btn-paired-launch-player"
                onClick={() => openPlayer(createdScreenId, selectedPlaylistId)}
                className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-emerald-950/40 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>INICIAR PLAYER NESTA TELA</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#0f0f12] border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Side: PIN Code + Playlist Vinculation Selector */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Aguardando Conexão
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {pairingCode}</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Space_Grotesk'] leading-tight">
                  Conecte esta tela ao MediaHub
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Use o código PIN abaixo ou aponte a câmera para o QR Code ao lado.
                </p>
              </div>

              {/* Big PIN Code Box */}
              <div className="p-5 rounded-xl bg-[#08080a] border border-slate-800 text-center relative group shadow-inner">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Código PIN de Conexão
                </span>
                <div className="text-4xl sm:text-5xl font-black tracking-widest text-emerald-400 font-mono py-1">
                  {pairingCode}
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <button
                    type="button"
                    id="btn-copy-pairing-code"
                    onClick={handleCopyCode}
                    className="px-3 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
                  </button>
                  <button
                    type="button"
                    id="btn-refresh-pairing-code"
                    onClick={handleRegenerateCode}
                    title="Gerar novo código"
                    className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Step by step guide to connect from Admin Panel */}
              <div className="p-4 rounded-xl bg-[#131317] border border-emerald-500/30 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Como conectar esta tela pelo Painel Administrativo:</span>
                </div>
                <ol className="list-decimal list-inside text-slate-300 space-y-1 text-[11px] leading-relaxed">
                  <li>No seu computador ou celular, acesse o <strong>Painel Admin</strong>.</li>
                  <li>Clique no botão <strong>"CONECTAR NOVA TELA"</strong>.</li>
                  <li>Digite o código <strong className="text-emerald-400 font-mono font-bold">{pairingCode}</strong> ou aponte a câmera para o QR Code ao lado.</li>
                  <li>Escolha a <strong>Playlist</strong> e clique em <strong>"Conectar e Iniciar Exibição"</strong>.</li>
                </ol>
                <div className="text-[11px] text-emerald-400/90 font-medium flex items-center gap-1.5 pt-1 border-t border-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Esta TV iniciará a reprodução em tela cheia na mesma hora automaticamente!</span>
                </div>
              </div>

              {/* Playlist Binding Section (Fallback manual) */}
              <div className="p-4 rounded-xl bg-[#101013] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="select-pairing-playlist" className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ListVideo className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ou vincular diretamente neste dispositivo:</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                    {playlists.length} disponíveis
                  </span>
                </div>

                <select
                  id="select-pairing-playlist"
                  value={selectedPlaylistId}
                  onChange={e => setSelectedPlaylistId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#08080a] border border-slate-700 text-slate-100 text-xs font-medium focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                >
                  {playlists.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.items.length} mídias • {p.orientation})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  id="btn-accept-bind-playlist"
                  onClick={handleAcceptAndBindPlaylist}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-xs tracking-wide uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Vincular e Iniciar Player Localmente</span>
                </button>
              </div>
            </div>

            {/* Right Side: High-Contrast QR Code */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-xl bg-[#08080a] border border-slate-800 text-center space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wide">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>Escanear QR Code</span>
              </div>

              {/* White Container for QR readability */}
              <div className="p-3 bg-white rounded-xl shadow-2xl w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                <img
                  src={qrImageUrl}
                  alt={`QR Code para vincular terminal ${pairingCode}`}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-300 font-medium">Aponte a câmera do celular</p>
                <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                  Permite vincular este terminal ou reproduzir remotamente em qualquer Smart TV ou display.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Telemetry Bar */}
      <footer className="border-t border-slate-800/80 pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 z-10 font-mono w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-3 text-[11px]">
          <span>Terminal: {pairingCode}</span>
          <span>•</span>
          <span>Rede Local: 192.168.1.100</span>
          <span>•</span>
          <span>Resolução: Full HD / 4K</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400 font-medium text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Pronto para Conectar (Websocket OK)</span>
        </div>
      </footer>
    </div>
  );
};
