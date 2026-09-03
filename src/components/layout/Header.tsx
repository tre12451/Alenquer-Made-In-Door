import React, { useState } from 'react';
import {
  Menu,
  Play,
  AlertOctagon,
  Wifi,
  WifiOff,
  Bell,
  Search,
  Building2,
  Tv,
  ExternalLink,
  RefreshCw,
  Plus,
  Share2,
} from 'lucide-react';
import { useSignage } from '../../context/SignageContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    activeView,
    openPlayer,
    setShareModalScreen,
    isSimulatingOffline,
    toggleSimulateOffline,
    emergencyAlert,
    triggerEmergency,
    clearEmergency,
    setIsAddScreenOpen,
    setIsUploadMediaOpen,
    setIsCreatePlaylistOpen,
    branches,
    screens,
    toastMessage,
  } = useSignage();

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');

  const getTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Visão Geral da Operação';
      case 'screens': return 'Gerenciamento de Telas & Players';
      case 'media': return 'Biblioteca de Conteúdos & Mídias';
      case 'playlists': return 'Editor de Playlists';
      case 'schedule': return 'Agendamento Inteligente';
      case 'dynamic': return 'Conteúdo Automático & RSS';
      case 'widgets': return 'Biblioteca de Widgets';
      case 'layouts': return 'Editor Multi-Zonas & Telas';
      case 'ticker': return 'Letreiro & Transmissão Emergencial';
      case 'monitoring': return 'Monitoramento Remoto em Tempo Real';
      case 'reports': return 'Relatórios de Exibição & Uptime';
      case 'branches': return 'Filiais & Ambientes';
      case 'users': return 'Usuários & Permissões';
      case 'settings': return 'Configurações do Player e Plataforma';
      default: return 'Painel Administrativo';
    }
  };

  const onlineCount = screens.filter(s => s.status === 'online').length;

  return (
    <>
      <header
        id="app-header"
        className="h-16 border-b border-slate-800 bg-[#0c0c0e]/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between gap-4"
      >
        {/* Left Side: Mobile Menu Button & Unit/Sync Telemetry */}
        <div className="flex items-center gap-3">
          <button
            id="btn-mobile-sidebar-toggle"
            onClick={onOpenMobileMenu}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Abrir Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>
              Filiais: <b className="text-slate-100 font-semibold">Todas as Unidades</b>
            </span>
            <span className="w-px h-3.5 bg-slate-800 hidden sm:block" />
            <span className="hidden sm:inline-flex items-center gap-1.5">
              Sincronização: <b className="text-emerald-500 font-semibold">100% OK</b>
            </span>
            <span className="w-px h-3.5 bg-slate-800 hidden lg:block" />
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <span className="text-slate-300 font-medium">{getTitle()}</span>
              <span className="text-slate-500">({onlineCount} online)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Actions & Player Trigger */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Offline-First Simulation Toggle */}
          <button
            id="btn-toggle-offline-simulation"
            onClick={toggleSimulateOffline}
            title={isSimulatingOffline ? "Restaurar Internet" : "Simular Queda de Conexão"}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
              isSimulatingOffline
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse'
                : 'bg-[#121214] hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
          >
            {isSimulatingOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Modo Queda de Rede</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rede Online</span>
              </>
            )}
          </button>

          {/* Emergency Alert Button */}
          {emergencyAlert.isActive ? (
            <button
              id="btn-clear-emergency-active"
              onClick={clearEmergency}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs animate-pulse shadow-lg shadow-rose-900/40"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>ENCERRAR ALERTA</span>
            </button>
          ) : (
            <button
              id="btn-trigger-emergency-modal"
              onClick={() => setIsEmergencyModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-md bg-rose-950/20 hover:bg-rose-900/40 text-rose-400 border border-rose-900/30 text-xs font-semibold transition-colors"
              title="Disparar aviso urgente para todas as telas"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">ALERTA EMERGENCIAL</span>
            </button>
          )}

          {/* Notifications Icon Button */}
          <div
            id="btn-header-bell"
            className="w-8 h-8 border border-slate-800 rounded-md flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            title="Notificações do Sistema"
          >
            <Bell className="w-3.5 h-3.5" />
          </div>

          {/* Share Player Link */}
          <button
            id="btn-header-share-player"
            onClick={() => setShareModalScreen(screens[0])}
            className="p-2 border border-slate-800 rounded-md hover:bg-slate-800 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
            title="Compartilhar Link do Player / Conectar Smart TV"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Primary CTA: ABRIR PLAYER (NOVA GUIA) */}
          <button
            id="btn-header-open-player"
            onClick={() => openPlayer()}
            className="px-3.5 lg:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Abrir Player em nova guia"
          >
            <ExternalLink className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">ABRIR EM NOVA GUIA</span>
            <span className="sm:hidden">PLAYER</span>
          </button>
        </div>
      </header>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed bottom-5 right-5 z-50 max-w-md bg-[#121214] border border-slate-800 text-slate-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" />
          <p className="text-xs font-medium">{toastMessage}</p>
        </div>
      )}

      {/* Emergency Modal */}
      {isEmergencyModalOpen && (
        <div
          id="emergency-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-[#121214] border border-rose-900/40 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20">
                <AlertOctagon className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 font-['Space_Grotesk']">
                  TRANSMISSÃO EMERGENCIAL
                </h3>
                <p className="text-xs text-slate-400">
                  Interrompe imediatamente todas as telas conectadas com aviso sonoro e visual.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título do Alerta
                </label>
                <input
                  id="input-emergency-title"
                  type="text"
                  defaultValue="🚨 COMUNICADO URGENTE: EVACUAÇÃO PREVENTIVA"
                  className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 text-xs font-semibold focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mensagem Exibida em Tela Cheia
                </label>
                <textarea
                  id="textarea-emergency-message"
                  rows={3}
                  defaultValue="Por favor, mantenham a calma e dirijam-se com tranquilidade às saídas de emergência sinalizadas. Siga as orientações da equipe de brigada."
                  className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    id="checkbox-emergency-siren"
                    className="rounded-xs bg-slate-800 border-slate-700 text-rose-600 focus:ring-0"
                  />
                  <span>Sirene Sonora Visual</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    id="checkbox-emergency-all-screens"
                    className="rounded-xs bg-slate-800 border-slate-700 text-rose-600 focus:ring-0"
                  />
                  <span>Todas as 12 Telas</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                id="btn-cancel-emergency"
                onClick={() => setIsEmergencyModalOpen(false)}
                className="px-4 py-2 rounded-md text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                id="btn-confirm-emergency"
                onClick={() => {
                  const titleEl = document.getElementById('input-emergency-title') as HTMLInputElement;
                  const msgEl = document.getElementById('textarea-emergency-message') as HTMLTextAreaElement;
                  triggerEmergency(
                    titleEl ? titleEl.value : '🚨 COMUNICADO URGENTE',
                    msgEl ? msgEl.value : 'Atenção a todos.',
                    'evacuation',
                    true
                  );
                  setIsEmergencyModalOpen(false);
                }}
                className="px-4 py-2 rounded-md text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-colors"
              >
                DISPARAR AGORA
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
