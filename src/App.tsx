import React, { useState } from 'react';
import { SignageProvider, useSignage } from './context/SignageContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { SignagePlayer } from './components/player/SignagePlayer';
import { PairingScreen } from './components/player/PairingScreen';
import { DashboardView } from './components/dashboard/DashboardView';
import { ScreensView } from './components/screens/ScreensView';
import { MediaLibraryView } from './components/media/MediaLibraryView';
import { PlaylistsView } from './components/playlists/PlaylistsView';
import { ScheduleView } from './components/schedule/ScheduleView';
import { DynamicContentView } from './components/dynamic/DynamicContentView';
import { WidgetsView } from './components/widgets/WidgetsView';
import { MultiZoneView } from './components/zones/MultiZoneView';
import { TickerAlertsView } from './components/ticker/TickerAlertsView';
import { MonitoringView } from './components/monitoring/MonitoringView';
import { ReportsView } from './components/reports/ReportsView';
import { BranchesView } from './components/branches/BranchesView';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';
import { SharePlayerModal } from './components/player/SharePlayerModal';
import { SupabaseSyncModal } from './components/sync/SupabaseSyncModal';
import { ConnectScreenModal } from './components/screens/ConnectScreenModal';
import { Play, Tv, ExternalLink, Share2, PanelLeftOpen } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeView,
    openPlayer,
    openConnectScreen,
    openConnectModalWithCode,
    isConnectScreenModalOpen,
    setIsConnectScreenModalOpen,
    connectScreenInitialCode,
    setActiveView,
    setShareModalScreen,
    screens,
    isSupabaseModalOpen,
    setIsSupabaseModalOpen,
  } = useSignage();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mediahub_sidebar_open');
      if (stored !== null) return stored === 'true';
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('mediahub_sidebar_open', String(next));
      }
      return next;
    });
  };

  // 1. Full-screen Player Mode
  if (activeView === 'player') {
    return <SignagePlayer />;
  }

  // 2. TV Pairing Screen Mode (Interactive TV registration terminal)
  if (activeView === 'pair') {
    return <PairingScreen />;
  }

  // 3. Admin Panel Layout with Sidebar & Header
  return (
    <div id="admin-shell-root" className="min-h-screen bg-[#09090b] text-slate-100 flex font-sans antialiased selection:bg-indigo-600/30 selection:text-indigo-200">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Floating button to show sidebar if closed */}
      {!isSidebarOpen && (
        <button
          id="btn-floating-open-sidebar"
          onClick={toggleSidebar}
          className="fixed left-0 top-20 z-40 bg-[#121214]/95 hover:bg-[#1f1f26] border border-l-0 border-indigo-500/40 text-slate-200 hover:text-white px-2.5 py-2 rounded-r-lg shadow-2xl flex items-center gap-2 text-xs font-semibold cursor-pointer group transition-all"
          title="Exibir Menu Lateral"
          aria-label="Exibir Menu Lateral"
        >
          <PanelLeftOpen className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] hidden sm:inline text-indigo-200 font-medium">Exibir Menu</span>
        </button>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#09090b]">
        <Header onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        <main className="flex-1 overflow-y-auto bg-[#09090b] relative pb-16">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'screens' && <ScreensView />}
          {activeView === 'media' && <MediaLibraryView />}
          {activeView === 'playlists' && <PlaylistsView />}
          {activeView === 'schedule' && <ScheduleView />}
          {activeView === 'dynamic' && <DynamicContentView />}
          {activeView === 'widgets' && <WidgetsView />}
          {activeView === 'zones' && <MultiZoneView />}
          {activeView === 'ticker' && <TickerAlertsView />}
          {activeView === 'monitoring' && <MonitoringView />}
          {activeView === 'reports' && <ReportsView />}
          {activeView === 'branches' && <BranchesView />}
          {activeView === 'users' && <UsersView />}
          {activeView === 'settings' && <SettingsView />}

          {/* Global Connect Screen PIN/QR Modal */}
          <ConnectScreenModal
            isOpen={isConnectScreenModalOpen}
            onClose={() => setIsConnectScreenModalOpen(false)}
            initialCode={connectScreenInitialCode}
          />

          {/* Global Share Player / Connect TV Modal */}
          <SharePlayerModal />

          {/* Supabase Full Sync & SQL Modal */}
          <SupabaseSyncModal
            isOpen={isSupabaseModalOpen}
            onClose={() => setIsSupabaseModalOpen(false)}
          />

          {/* Floating Quick Player Launcher for easy switching */}
          <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
            <button
              id="btn-floating-pair-mode"
              onClick={() => openConnectModalWithCode()}
              className="px-3.5 py-2 rounded-md bg-[#121214] hover:bg-[#1a1a1e] text-slate-300 border border-slate-800 text-xs font-semibold shadow-xl flex items-center gap-2 transition-all backdrop-blur-md cursor-pointer"
              title="Conectar e parear nova tela por código PIN ou QR Code"
            >
              <div className="w-3.5 h-3.5 border border-emerald-400 rounded-xs flex items-center justify-center">
                <Tv className="w-2.5 h-2.5 text-emerald-400" />
              </div>
              <span className="hidden sm:inline">CONECTAR TELA</span>
            </button>

            <button
              id="btn-floating-share-link"
              onClick={() => setShareModalScreen(screens[0])}
              className="px-3.5 py-2 rounded-md bg-[#18181b] hover:bg-[#202024] text-slate-200 border border-slate-800 text-xs font-semibold shadow-xl flex items-center gap-1.5 transition-all cursor-pointer"
              title="Compartilhar link do player para TV ou qualquer dispositivo"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Compartilhar Link</span>
            </button>

            <button
              id="btn-floating-player"
              onClick={() => openPlayer()}
              className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all cursor-pointer"
              title="Abre o player em uma nova guia em tela cheia"
            >
              <ExternalLink className="w-3.5 h-3.5 text-white" />
              <span>ABRIR PLAYER (NOVA GUIA)</span>
            </button>
          </div>
        </main>

        {/* Geometric Balance Theme Accent Footer Strip */}
        <div className="bg-indigo-600 h-1 px-8 flex justify-end items-center text-[9px] text-indigo-200 font-semibold tracking-widest uppercase shrink-0">
          MediaHub v3.8.4 Enterprise • Geometric Balance
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <SignageProvider>
      <AppContent />
    </SignageProvider>
  );
}
