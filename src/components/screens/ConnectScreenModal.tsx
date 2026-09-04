import React, { useState, useEffect, useRef } from 'react';
import {
  Tv,
  QrCode,
  Radio,
  CheckCircle2,
  X,
  Play,
  ListVideo,
  Building2,
  Camera,
  CameraOff,
  Sparkles,
  ArrowRight,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useSignage } from '../../context/SignageContext';

interface ConnectScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
}

export const ConnectScreenModal: React.FC<ConnectScreenModalProps> = ({
  isOpen,
  onClose,
  initialCode = '',
}) => {
  const {
    playlists,
    branches,
    addScreen,
    openPlayer,
    isSupabaseConnected,
    showToast,
    openConnectScreen,
  } = useSignage();

  const [pinCode, setPinCode] = useState('');
  const [screenName, setScreenName] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || 'b-centro');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(playlists[0]?.id || 'pl-1');
  const [openPlayerImmediately, setOpenPlayerImmediately] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      const code = initialCode.trim();
      if (code) {
        const formatted = code.toUpperCase().startsWith('MH-') ? code.toUpperCase() : `MH-${code.toUpperCase()}`;
        setPinCode(formatted);
        setScreenName(`TV ${formatted}`);
      } else {
        setPinCode('');
        setScreenName('');
      }
      setSelectedBranchId(branches[0]?.id || 'b-centro');
      setSelectedPlaylistId(playlists[0]?.id || 'pl-1');
      setIsScanningCamera(false);
      setCameraError(null);
    } else {
      stopCamera();
    }
  }, [isOpen, initialCode, branches, playlists]);

  // Handle PIN input with automatic MH- prefix formatting
  const handlePinChange = (value: string) => {
    let clean = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (clean.length > 0 && !clean.startsWith('MH-') && !clean.startsWith('M')) {
      clean = `MH-${clean}`;
    }
    setPinCode(clean);
    if (!screenName || screenName.startsWith('TV MH-') || screenName.startsWith('TV ')) {
      setScreenName(clean ? `TV ${clean}` : '');
    }
  };

  // Camera QR Scanner stream management
  const startCamera = async () => {
    setCameraError(null);
    setIsScanningCamera(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } else {
        setCameraError('Câmera não suportada neste dispositivo.');
      }
    } catch (err: any) {
      console.error('Erro ao abrir câmera:', err);
      setCameraError('Acesso à câmera bloqueado ou indisponível.');
      setIsScanningCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanningCamera(false);
  };

  const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId) || playlists[0];
  const selectedBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let cleanPin = pinCode.trim().toUpperCase();
    if (!cleanPin) {
      showToast('Por favor, informe o Código PIN da tela.');
      return;
    }

    if (!cleanPin.startsWith('MH-')) {
      cleanPin = `MH-${cleanPin}`;
    }

    setIsSubmitting(true);
    stopCamera();

    const screenId = `scr-${Date.now()}`;
    const finalName = screenName.trim() || `TV ${cleanPin} — ${selectedBranch?.name || 'Painel'}`;

    // 1. Cadastra a nova tela no estado
    addScreen({
      id: screenId,
      code: cleanPin,
      name: finalName,
      branchId: selectedBranch?.id || 'b-centro',
      branchName: selectedBranch?.name || 'Loja Centro',
      environment: 'Terminal TV Conectado',
      status: 'online',
      currentPlaylistId: selectedPlaylistId,
      currentPlaylistName: selectedPlaylist?.name || 'Playlist Principal',
    });

    // 2. Dispara sinal via BroadcastChannel para a TV/Aba que está com esse código iniciar o player
    try {
      const channel = new BroadcastChannel('mediahub_pairing');
      channel.postMessage({
        type: 'PAIRED_START_PLAY',
        code: cleanPin,
        screenId,
        playlistId: selectedPlaylistId,
        playlistName: selectedPlaylist?.name,
      });
      channel.close();
    } catch (err) {
      // Ignora em navegadores sem suporte
    }

    // 3. Salva no localStorage para sincronizar entre abas
    try {
      localStorage.setItem(
        'mediahub_last_paired_event',
        JSON.stringify({
          code: cleanPin,
          screenId,
          playlistId: selectedPlaylistId,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      // Ignora erro de storage
    }

    showToast(`✓ Tela "${finalName}" vinculada com sucesso à playlist "${selectedPlaylist?.name}"!`);

    // 4. Se solicitado, abre o player imediatamente em nova guia
    if (openPlayerImmediately) {
      openPlayer(screenId, selectedPlaylistId);
    }

    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="modal-connect-screen-root"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#101014] border border-emerald-500/30 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-950/40">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] tracking-tight">
                  Conectar e Parear Nova Tela
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                  Vínculo Rápido
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Digite o código PIN exibido na TV para vincular à playlist e iniciar a exibição.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-connect-modal-x"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo 1: Código PIN da Tela com visual destacado */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="input-screen-pin" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>Código PIN exibido na TV:</span>
              </label>
              <div className="flex items-center gap-2">
                {!isScanningCamera ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Ler QR Code</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Fechar Câmera</span>
                  </button>
                )}
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => openConnectScreen()}
                  className="text-[11px] text-slate-400 hover:text-emerald-400 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  title="Abrir tela de TV para gerar um novo código"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Gerar na TV</span>
                </button>
              </div>
            </div>

            {/* Visual PIN Input Box */}
            <div className="relative">
              <input
                type="text"
                id="input-screen-pin"
                required
                value={pinCode}
                onChange={e => handlePinChange(e.target.value)}
                placeholder="Ex: MH-4880 ou 4880"
                className="w-full px-4 py-3.5 rounded-xl bg-[#08080a] border border-emerald-500/40 text-emerald-400 text-xl font-mono font-bold tracking-widest placeholder:text-slate-600 placeholder:font-sans placeholder:text-sm placeholder:font-normal focus:outline-hidden focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/40"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-500 uppercase">
                PIN DA TELA
              </span>
            </div>

            {/* Câmera Stream (se ativa) */}
            {isScanningCamera && (
              <div className="p-3 rounded-xl bg-black border border-cyan-500/40 space-y-2">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-cyan-400/60 pointer-events-none m-8 rounded-lg animate-pulse" />
                </div>
                <p className="text-[11px] text-center text-cyan-300">
                  Aponte para o QR Code da tela. Você também pode digitar o código acima diretamente.
                </p>
              </div>
            )}

            {cameraError && (
              <p className="text-[11px] text-rose-400 bg-rose-950/20 p-2 rounded border border-rose-900/30">
                {cameraError} Você pode digitar o código PIN manualmente acima.
              </p>
            )}
          </div>

          {/* Campo 2: Nome e Identificação da Tela */}
          <div className="space-y-1.5">
            <label htmlFor="input-screen-name" className="text-xs font-semibold text-slate-300">
              Nome de Identificação da Tela:
            </label>
            <input
              type="text"
              id="input-screen-name"
              value={screenName}
              onChange={e => setScreenName(e.target.value)}
              placeholder="Ex: TV 05 — Loja Centro Recepção"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#141418] border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Campo 3: Filial / Unidade */}
          <div className="space-y-1.5">
            <label htmlFor="select-screen-branch" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Filial / Unidade:</span>
            </label>
            <select
              id="select-screen-branch"
              value={selectedBranchId}
              onChange={e => setSelectedBranchId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#141418] border border-slate-700 text-white text-xs focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city} - {b.state})
                </option>
              ))}
            </select>
          </div>

          {/* Campo 4: Vínculo Direto da Playlist (O PONTO PRINCIPAL) */}
          <div className="p-4 rounded-xl bg-[#141418] border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="select-screen-playlist" className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <ListVideo className="w-4 h-4 text-emerald-400" />
                <span>Vincular à Playlist (Início Automático):</span>
              </label>
              <span className="text-[10px] text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 font-semibold">
                {playlists.length} playlists disponíveis
              </span>
            </div>

            <select
              id="select-screen-playlist"
              value={selectedPlaylistId}
              onChange={e => setSelectedPlaylistId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#08080a] border border-slate-700 text-white text-xs font-medium focus:outline-hidden focus:border-emerald-500 cursor-pointer"
            >
              {playlists.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.items.length} mídias ({p.orientation})
                </option>
              ))}
            </select>

            {/* Mini preview da playlist selecionada */}
            {selectedPlaylist && (
              <div className="p-2.5 rounded-lg bg-[#0a0a0c] border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
                <span className="truncate max-w-[280px]">
                  ✓ Duração: <strong>{selectedPlaylist.totalDurationSeconds}s</strong> • Orientação: <strong>{selectedPlaylist.orientation}</strong>
                </span>
                <span className="text-emerald-400 font-semibold shrink-0">
                  {selectedPlaylist.items.length} itens ativos
                </span>
              </div>
            )}
          </div>

          {/* Opção: Abrir Player Imediatamente */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="check-open-player-immediately"
              checked={openPlayerImmediately}
              onChange={e => setOpenPlayerImmediately(e.target.checked)}
              className="w-4 h-4 rounded bg-[#141418] border-slate-700 text-emerald-500 focus:ring-0 focus:outline-hidden cursor-pointer"
            />
            <label htmlFor="check-open-player-immediately" className="text-xs text-slate-300 cursor-pointer select-none">
              Abrir Player desta tela imediatamente em nova guia após conectar
            </label>
          </div>

          {/* Rodapé / Ações */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              id="btn-cancel-connect-screen"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-[#18181c] hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-confirm-connect-screen"
              disabled={isSubmitting || !pinCode.trim()}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>CONECTAR E INICIAR EXIBIÇÃO</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
