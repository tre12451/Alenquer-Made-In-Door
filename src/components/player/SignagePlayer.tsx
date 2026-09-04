import React, { useState, useEffect, useRef } from 'react';
import {
  WifiOff,
  AlertTriangle,
  RotateCw,
  Clock,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  Globe,
} from 'lucide-react';
import { useSignage } from '../../context/SignageContext';
import { PlaylistItem, MediaItem } from '../../types';
import { getScreenSlug } from '../../lib/slug';

export const SignagePlayer: React.FC = () => {
  const {
    screens,
    playlists,
    playerScreenId,
    playerPlaylistId,
    isSimulatingOffline,
    syncNotification,
    emergencyAlert,
  } = useSignage();

  // Find target screen and playlist
  const currentScreen = screens.find(
    s => s.id === playerScreenId ||
         s.slug?.toLowerCase() === playerScreenId?.toLowerCase() ||
         s.code?.toLowerCase() === playerScreenId?.toLowerCase()
  ) || screens[0];
  const currentPlaylist = playlists.find(p => p.id === playerPlaylistId) || playlists[0];

  const items = currentPlaylist.items || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0); // 0-100%
  const [watchdogStatus] = useState<'normal' | 'recovered'>('normal');
  const [fullscreenCountdown, setFullscreenCountdown] = useState<number | null>(5);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentItem: PlaylistItem | undefined = items[currentIndex];
  const currentMedia: MediaItem | undefined = currentItem?.media;
  const durationSeconds = currentItem?.customDurationSeconds || currentMedia?.durationSeconds || 10;

  // Auto-hide controls after 2.5 seconds of inactivity (YouTube-style)
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2500);
  };

  useEffect(() => {
    resetControlsTimeout();

    const onUserActivity = () => {
      resetControlsTimeout();
    };

    window.addEventListener('mousemove', onUserActivity);
    window.addEventListener('mousedown', onUserActivity);
    window.addEventListener('touchstart', onUserActivity);
    window.addEventListener('keydown', onUserActivity);

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      window.removeEventListener('mousemove', onUserActivity);
      window.removeEventListener('mousedown', onUserActivity);
      window.removeEventListener('touchstart', onUserActivity);
      window.removeEventListener('keydown', onUserActivity);
    };
  }, []);

  // Clock in the corner
  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    if (items.length > 0) {
      setCurrentIndex(prev => (prev + 1) % items.length);
      setProgress(0);
    }
  };

  const handlePrev = () => {
    if (items.length > 0) {
      setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
      setProgress(0);
    }
  };

  const enterFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Fullscreen detection and 5-second auto-trigger
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (isFs) {
        setFullscreenCountdown(null);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);

    // Initial check
    if (document.fullscreenElement) {
      setIsFullscreen(true);
      setFullscreenCountdown(null);
      return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }

    // 5-second countdown to enter fullscreen
    let secondsLeft = 5;
    setFullscreenCountdown(5);

    const countdownTimer = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        clearInterval(countdownTimer);
        setFullscreenCountdown(null);
        enterFullscreen();
      } else {
        setFullscreenCountdown(secondsLeft);
      }
    }, 1000);

    return () => {
      clearInterval(countdownTimer);
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, []);

  // Media playback cycle & progress timer
  useEffect(() => {
    if (!isPlaying || items.length === 0) return;

    setProgress(0);
    const intervalMs = 100;
    const totalSteps = (durationSeconds * 1000) / intervalMs;
    let currentStep = 0;

    timerRef.current = setInterval(() => {
      currentStep++;
      const currentPct = Math.min(100, (currentStep / totalSteps) * 100);
      setProgress(currentPct);

      if (currentStep >= totalSteps) {
        setCurrentIndex(prev => (prev + 1) % items.length);
        setProgress(0);
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPlaying, durationSeconds, items.length]);

  // Keyboard navigation & remote control handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items.length]);

  // Transition style calculation
  const getTransitionClasses = () => {
    const transition = currentItem?.transition || 'fade';
    switch (transition) {
      case 'slide':
        return 'animate-in slide-in-from-right duration-700';
      case 'zoom':
        return 'animate-in zoom-in-90 duration-700';
      case 'dissolve':
        return 'animate-in fade-in duration-1000';
      case 'kenburns':
        return 'animate-in zoom-in-105 duration-1000';
      default:
        return 'animate-in fade-in duration-500';
    }
  };

  return (
    <div
      id="digital-signage-player-root"
      onClick={() => {
        resetControlsTimeout();
        if (!document.fullscreenElement) {
          enterFullscreen();
        }
      }}
      onDoubleClick={toggleFullscreen}
      className={`relative w-screen h-screen bg-black text-white overflow-hidden select-none transition-all ${
        showControls ? 'cursor-default' : 'cursor-none'
      }`}
    >
      {/* 1. TOP PROGRESS BAR (Subtle 2px countdown line) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-900/40 z-30 pointer-events-none">
        <div
          className="h-full bg-emerald-500/80 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 5-SECOND FULLSCREEN AUTO-ENTER INDICATOR (Visible only before fullscreen and while active) */}
      {fullscreenCountdown !== null && !isFullscreen && (
        <div
          id="player-fullscreen-countdown-pill"
          onClick={(e) => {
            e.stopPropagation();
            enterFullscreen();
          }}
          className={`absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/90 border border-emerald-500/50 text-slate-100 px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-3 shadow-2xl backdrop-blur-md transition-all duration-300 cursor-pointer hover:bg-neutral-800 ${
            showControls ? 'opacity-100' : 'opacity-60 hover:opacity-100'
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Maximize2 className="w-4 h-4 text-emerald-400" />
          <span>
            Tela cheia em <strong className="text-emerald-400 font-mono text-sm px-1">{fullscreenCountdown}s</strong>
          </span>
          <span className="text-[11px] text-slate-400 font-normal border-l border-slate-700 pl-2 hidden sm:inline">
            Clique para ativar agora
          </span>
        </div>
      )}

      {/* 2. EMERGENCY OVERLAY (When Emergency Broadcast is Triggered) */}
      {emergencyAlert.isActive && (
        <div
          id="player-emergency-overlay"
          className="absolute inset-0 z-50 bg-red-950 flex flex-col items-center justify-center p-8 text-center animate-pulse"
        >
          <div className="max-w-4xl p-10 rounded-3xl bg-red-900/90 border-4 border-red-500 shadow-2xl shadow-red-900 flex flex-col items-center space-y-6">
            <div className="p-5 rounded-full bg-red-600 text-white animate-bounce">
              <AlertTriangle className="w-20 h-20" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight uppercase">
              {emergencyAlert.title}
            </h1>
            <p className="text-xl lg:text-3xl font-semibold text-red-100 leading-relaxed max-w-3xl">
              {emergencyAlert.message}
            </p>
            <div className="pt-4 flex items-center gap-3 text-sm text-red-200 uppercase font-bold tracking-widest">
              <span>Transmissão Prioritária • Todas as Telas Interrompidas</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. WATCHDOG FAILOVER BANNER (Briefly shown if auto-recovered) */}
      {watchdogStatus === 'recovered' && (
        <div className="absolute top-4 right-4 z-40 bg-amber-500/90 text-black px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg animate-bounce">
          <ShieldCheck className="w-4 h-4" />
          <span>Watchdog: Mídia corrompida evitada com sucesso. Próxima mídia em execução!</span>
        </div>
      )}

      {/* 4. OFFLINE CACHE STATUS BADGE (Shows when simulating offline) */}
      {isSimulatingOffline && (
        <div className="absolute top-4 left-4 z-40 bg-neutral-900/90 border border-amber-500/50 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg backdrop-blur-md">
          <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Cache Local Ativo • Reprodução Offline</span>
        </div>
      )}

      {/* 5. SYNC NOTIFICATION BANNER */}
      {syncNotification && (
        <div className="absolute top-4 left-4 z-40 bg-neutral-900/90 border border-cyan-500/50 text-cyan-300 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg backdrop-blur-md">
          <RotateCw className="w-4 h-4 animate-spin text-cyan-400" />
          <span>{syncNotification}</span>
        </div>
      )}

      {/* 6. FULLSCREEN MEDIA STAGE (100% Edge-to-Edge Pure Playback) */}
      <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-black">
        {currentMedia?.type === 'video' ? (
          <video
            key={currentMedia.url}
            src={currentMedia.url}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className={`w-full h-full object-cover ${getTransitionClasses()}`}
          />
        ) : currentMedia?.type === 'rss' ? (
          /* Automated News Presentation */
          <div className={`w-full h-full relative flex items-center justify-center bg-neutral-950 ${getTransitionClasses()}`}>
            <img
              src={currentMedia.url}
              alt={currentMedia.title}
              className="absolute inset-0 w-full h-full object-cover opacity-35 filter blur-xs"
            />
            <div className="relative z-10 max-w-5xl px-8 py-12 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-md bg-red-600 text-white font-extrabold text-xs tracking-wider uppercase">
                  G1 NOTÍCIAS • ECONOMIA
                </span>
                <span className="text-sm text-neutral-300 font-medium">Atualizado há 10 minutos</span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-extrabold text-white leading-tight font-['Space_Grotesk']">
                {currentMedia.title}
              </h2>
              <p className="text-lg lg:text-xl text-neutral-200 leading-relaxed max-w-3xl">
                Produção industrial e setor de serviços aceleram contratações na região metropolitana com apoio de automação e logística inteligente.
              </p>
              <div className="flex items-center gap-4 text-sm text-neutral-400 pt-4 border-t border-white/10">
                <span className="font-semibold text-white">Fonte: Agência Brasil / Central de Jornalismo</span>
                <span>•</span>
                <span>Transmissão em tempo real</span>
              </div>
            </div>
          </div>
        ) : currentMedia?.type === 'widget' && currentMedia.title.includes('Esportes') ? (
          /* Live Sports Scoreboard Widget */
          <div className={`w-full h-full relative flex flex-col justify-center items-center bg-radial from-neutral-900 to-black p-8 ${getTransitionClasses()}`}>
            <div className="max-w-4xl w-full bg-neutral-900/90 border border-neutral-700 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-sm font-extrabold text-emerald-400 tracking-wider uppercase">AO VIVO • 78 MIN</span>
                </div>
                <span className="text-sm font-bold text-neutral-400">COPA LIBERTADORES 2026</span>
              </div>

              <div className="py-8 flex items-center justify-around">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 rounded-full bg-emerald-800/80 border-2 border-emerald-400 flex items-center justify-center text-2xl font-black mx-auto">
                    PAL
                  </div>
                  <h4 className="text-xl font-bold text-white">Palmeiras</h4>
                  <p className="text-xs text-neutral-400">Mandante</p>
                </div>

                <div className="text-center px-6">
                  <div className="text-5xl lg:text-7xl font-black font-['Space_Grotesk'] text-white tracking-widest">
                    2 <span className="text-neutral-600">:</span> 1
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold mt-2">Segundo Tempo em Andamento</p>
                </div>

                <div className="text-center space-y-2">
                  <div className="w-20 h-20 rounded-full bg-red-800/80 border-2 border-red-400 flex items-center justify-center text-2xl font-black mx-auto">
                    RIV
                  </div>
                  <h4 className="text-xl font-bold text-white">River Plate</h4>
                  <p className="text-xs text-neutral-400">Visitante</p>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 text-center text-xs text-neutral-400">
                Próxima partida: Flamengo x Boca Juniors (21h30) • Transmissão Oficial
              </div>
            </div>
          </div>
        ) : currentMedia?.type === 'widget' && currentMedia.title.includes('Previsão') ? (
          /* Dynamic Weather Screen */
          <div className={`w-full h-full relative flex items-center justify-center bg-linear-to-br from-indigo-950 via-neutral-900 to-black p-8 ${getTransitionClasses()}`}>
            <div className="max-w-4xl w-full bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase border border-amber-500/30">
                  PREVISÃO EM TEMPO REAL
                </span>
                <h2 className="text-4xl font-extrabold text-white font-['Space_Grotesk']">
                  São Paulo, Capital
                </h2>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <span className="text-7xl font-black font-['Space_Grotesk'] text-amber-400">
                    27°C
                  </span>
                  <div className="text-sm text-neutral-300">
                    <p className="font-semibold text-white">Sol com Nuvens</p>
                    <p>Mín: 18°C • Máx: 29°C</p>
                    <p>Umidade: 55%</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
                {[
                  { day: 'Amanhã', temp: '28°', cond: 'Ensolarado', icon: '☀️' },
                  { day: 'Sexta', temp: '26°', cond: 'Pancadas', icon: '🌦️' },
                  { day: 'Sábado', temp: '24°', cond: 'Chuva leve', icon: '🌧️' },
                ].map((f, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
                    <span className="text-2xl">{f.icon}</span>
                    <p className="text-xs font-medium text-neutral-400">{f.day}</p>
                    <p className="text-lg font-bold text-white">{f.temp}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Standard high-resolution image banner */
          <img
            key={currentMedia?.url}
            src={currentMedia?.url}
            alt={currentMedia?.title}
            className={`w-full h-full object-cover ${getTransitionClasses()}`}
          />
        )}

        {/* Discreet In-screen Clock Watermark */}
        <div className="absolute top-4 right-6 z-20 pointer-events-none select-none opacity-40">
          <div className="px-3 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/5 text-[11px] font-mono text-white/70 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>{timeStr}</span>
          </div>
        </div>
      </div>

      {/* YOUTUBE-STYLE BOTTOM CONTROLS OVERLAY (Auto-hides on inactivity) */}
      <div
        id="player-youtube-controls"
        onClick={(e) => e.stopPropagation()}
        className={`absolute bottom-0 left-0 right-0 z-40 px-6 pt-12 pb-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-between transition-all duration-300 ${
          showControls
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        {/* Left Side: Media title & Playback controls */}
        <div className="flex items-center gap-3">
          <button
            id="player-btn-play-pause"
            onClick={() => {
              resetControlsTimeout();
              setIsPlaying((p) => !p);
            }}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
            title={isPlaying ? 'Pausar (Espaço)' : 'Reproduzir (Espaço)'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            id="player-btn-next-item"
            onClick={() => {
              resetControlsTimeout();
              handleNext();
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
            title="Próxima Mídia (Seta Direita)"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            id="player-btn-volume"
            onClick={() => {
              resetControlsTimeout();
              setIsMuted((m) => !m);
            }}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
            title={isMuted ? 'Ativar som (M)' : 'Mutar (M)'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-neutral-300" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          <div className="ml-1 hidden sm:block">
            <p className="text-xs font-semibold text-white truncate max-w-xs md:max-w-md">
              {currentMedia?.title || 'Reprodução Digital Signage'}
            </p>
            <p className="text-[11px] text-neutral-400 flex items-center gap-2">
              <span>{currentScreen.name} • {currentPlaylist.name} ({currentIndex + 1}/{items.length || 1})</span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">
                <Globe className="w-2.5 h-2.5" />
                <span>login.com.br/{getScreenSlug(currentScreen)}</span>
              </span>
            </p>
          </div>
        </div>

        {/* Right Side: Direct Fullscreen Button (YouTube Style) */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-neutral-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
            <span>Atalho:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">F</kbd>
          </div>

          <button
            id="player-btn-fullscreen"
            onClick={(e) => {
              e.stopPropagation();
              resetControlsTimeout();
              toggleFullscreen();
            }}
            className="h-10 px-4 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-black/60 transition-all cursor-pointer backdrop-blur-md hover:scale-105 active:scale-95"
            title={isFullscreen ? 'Sair da tela cheia (F)' : 'Tela cheia direta (F)'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span>Sair da Tela Cheia</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span>Tela Cheia</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
