import React from 'react';
import {
  LayoutDashboard,
  Tv,
  Film,
  ListVideo,
  CalendarDays,
  Sparkles,
  Layers,
  Component,
  AlertTriangle,
  Activity,
  BarChart3,
  Building2,
  Users,
  Settings,
  PlaySquare,
  Radio,
  QrCode,
  HardDriveDownload,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useSignage, ActiveView } from '../../context/SignageContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeView, setActiveView, screens, media, playlists, openPlayer, emergencyAlert } = useSignage();

  const onlineScreens = screens.filter(s => s.status === 'online').length;
  const offlineScreens = screens.filter(s => s.status === 'offline').length;

  const navGroups = [
    {
      title: 'OPERAÇÃO PRINCIPAL',
      items: [
        { id: 'dashboard' as ActiveView, label: 'Dashboard', icon: LayoutDashboard },
        {
          id: 'screens' as ActiveView,
          label: 'Telas / Players',
          icon: Tv,
          badge: `${onlineScreens}/${screens.length}`,
          badgeColor: offlineScreens > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300',
        },
        { id: 'media' as ActiveView, label: 'Biblioteca de Mídias', icon: Film, badge: `${media.length}` },
        { id: 'playlists' as ActiveView, label: 'Playlists', icon: ListVideo, badge: `${playlists.length}` },
        { id: 'schedule' as ActiveView, label: 'Agendamento', icon: CalendarDays },
      ],
    },
    {
      title: 'CONTEÚDO & LAYOUT',
      items: [
        { id: 'dynamic' as ActiveView, label: 'Conteúdo Automático', icon: Sparkles },
        { id: 'widgets' as ActiveView, label: 'Widgets Dinâmicos', icon: Component },
        { id: 'layouts' as ActiveView, label: 'Multi-Zonas / Layouts', icon: Layers },
        {
          id: 'ticker' as ActiveView,
          label: 'Letreiro & Alertas',
          icon: AlertTriangle,
          badge: emergencyAlert.isActive ? 'EMERGÊNCIA' : undefined,
          badgeColor: 'bg-red-500 text-white animate-pulse',
        },
      ],
    },
    {
      title: 'GESTÃO & SUPORTE',
      items: [
        { id: 'monitoring' as ActiveView, label: 'Monitoramento Remoto', icon: Activity },
        { id: 'reports' as ActiveView, label: 'Relatórios & Analytics', icon: BarChart3 },
        { id: 'branches' as ActiveView, label: 'Filiais & Ambientes', icon: Building2 },
        { id: 'users' as ActiveView, label: 'Usuários & Auditoria', icon: Users },
        { id: 'settings' as ActiveView, label: 'Configurações', icon: Settings },
      ],
    },
  ];

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0c0c0e] border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between bg-[#0c0c0e]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-base text-white shadow-md shadow-indigo-950/40">
              M
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-100 font-['Space_Grotesk']">MEDIAHUB</span>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 uppercase tracking-wide">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Highlight Action: Open Player */}
        <div className="p-3 border-b border-slate-800 bg-[#09090b]/40">
          <button
            id="btn-sidebar-open-player"
            onClick={() => openPlayer()}
            className="w-full py-2.5 px-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-between shadow-lg shadow-emerald-950/40 group transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span>▶ ABRIR PLAYER</span>
            </div>
            <PlaySquare className="w-3.5 h-3.5 text-emerald-100 group-hover:scale-105 transition-transform" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                {group.title}
              </div>
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 flex items-center justify-center`}>
                        {isActive ? (
                          <div className="w-3.5 h-3.5 border-2 border-indigo-400 rounded-xs opacity-90" />
                        ) : (
                          <Icon className="w-4 h-4 opacity-70" />
                        )}
                      </div>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Cache & Offline Status Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#0c0c0e] space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <HardDriveDownload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cache Local Total</span>
            </div>
            <span className="font-semibold text-slate-200">4,8 GB / 16 GB</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '30%' }} />
          </div>
          <div className="flex items-center justify-between pt-0.5 text-[10px]">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
              Sincronizado há 14min
            </span>
            <span className="text-slate-500 font-mono">v3.8.4</span>
          </div>
        </div>

        {/* User Profile Bar */}
        <div className="p-3.5 border-t border-slate-800 flex items-center justify-between bg-[#0c0c0e]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200 shrink-0">
              JD
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-slate-200 truncate">João Silva</p>
              <p className="text-xs text-slate-500 truncate">Administrador</p>
            </div>
          </div>
          <button
            id="btn-sidebar-settings"
            onClick={() => handleNavClick('settings')}
            title="Configurações"
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
