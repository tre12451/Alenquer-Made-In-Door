import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ScreenDevice,
  MediaItem,
  Playlist,
  ScheduleItem,
  DynamicFeedItem,
  EmergencyBroadcast,
  Branch,
  AuditLog,
  SystemUser,
  SignageSettings,
} from '../types';
import {
  INITIAL_SCREENS,
  INITIAL_MEDIA,
  INITIAL_PLAYLISTS,
  INITIAL_SCHEDULES,
  DYNAMIC_FEEDS,
  INITIAL_BRANCHES,
  AUDIT_LOGS,
  SYSTEM_USERS,
  DEFAULT_SETTINGS,
} from '../data/mockData';
import {
  getSupabaseClient,
  getSupabaseCredentials,
  fetchRealScreensFromSupabase,
  fetchRealMediaFromSupabase,
  fetchRealPlaylistsFromSupabase,
  fetchRealEmergencyFromSupabase,
} from '../lib/supabase';

export type ActiveView =
  | 'dashboard'
  | 'screens'
  | 'media'
  | 'playlists'
  | 'schedule'
  | 'dynamic'
  | 'widgets'
  | 'layouts'
  | 'ticker'
  | 'monitoring'
  | 'reports'
  | 'branches'
  | 'users'
  | 'settings'
  | 'player'
  | 'pair'
  | 'login';

interface SignageContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  screens: ScreenDevice[];
  media: MediaItem[];
  playlists: Playlist[];
  schedules: ScheduleItem[];
  dynamicFeeds: DynamicFeedItem[];
  branches: Branch[];
  logs: AuditLog[];
  users: SystemUser[];
  settings: SignageSettings;
  updateSettings: (newSettings: Partial<SignageSettings>) => void;
  emergencyAlert: EmergencyBroadcast;
  triggerEmergency: (title: string, message: string, type: EmergencyBroadcast['type'], soundAlert: boolean) => void;
  clearEmergency: () => void;
  
  // Player state
  playerScreenId: string;
  playerPlaylistId: string;
  openPlayer: (screenId?: string, playlistId?: string) => void;
  openPlayerInNewTab: (screenId?: string, playlistId?: string) => void;
  copyPlayerLink: (screenId?: string, playlistId?: string) => void;
  getPlayerUrl: (screenId?: string, playlistId?: string) => string;
  shareModalScreen: ScreenDevice | null;
  setShareModalScreen: (screen: ScreenDevice | null) => void;
  exitPlayer: () => void;
  isSimulatingOffline: boolean;
  toggleSimulateOffline: () => void;
  syncNotification: string | null;
  triggerRemoteSync: (screenId: string) => void;
  triggerRemoteReboot: (screenId: string) => void;

  // Modals & UI helpers
  previewPlaylist: Playlist | null;
  setPreviewPlaylist: (pl: Playlist | null) => void;
  selectedScreenForDetails: ScreenDevice | null;
  setSelectedScreenForDetails: (scr: ScreenDevice | null) => void;
  isAddScreenOpen: boolean;
  setIsAddScreenOpen: (open: boolean) => void;
  isUploadMediaOpen: boolean;
  setIsUploadMediaOpen: (open: boolean) => void;
  isCreatePlaylistOpen: boolean;
  setIsCreatePlaylistOpen: (open: boolean) => void;

  // CRUD actions
  addScreen: (screen: Partial<ScreenDevice>) => void;
  updateScreen: (id: string, updates: Partial<ScreenDevice>) => void;
  deleteScreen: (id: string) => void;
  addMedia: (item: Partial<MediaItem>) => void;
  deleteMedia: (id: string) => void;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  addPlaylist: (pl: Partial<Playlist>) => void;
  deletePlaylist: (id: string) => void;
  duplicatePlaylist: (id: string) => void;
  
  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Supabase Real-time Sync
  isSupabaseConnected: boolean;
  isSyncingWithSupabase: boolean;
  syncWithSupabase: () => Promise<void>;
}

const SignageContext = createContext<SignageContextType | undefined>(undefined);

export const SignageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check URL params on initial load
  const getInitialView = (): ActiveView => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      const player = params.get('player');
      if (view === 'player' || player === 'true') {
        return 'player';
      }
      if (view === 'pair' || params.get('pair') === 'true') {
        return 'pair';
      }
    }
    return 'dashboard';
  };

  const getInitialScreenId = (): string => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const scr = params.get('screen') || params.get('screenId');
      if (scr) return scr;
    }
    return 'scr-1';
  };

  const getInitialPlaylistId = (): string => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pl = params.get('playlist') || params.get('playlistId');
      if (pl) return pl;
    }
    return 'pl-1';
  };

  const [activeView, setActiveView] = useState<ActiveView>(getInitialView);
  const [screens, setScreens] = useState<ScreenDevice[]>(INITIAL_SCREENS);
  const [media, setMedia] = useState<MediaItem[]>(INITIAL_MEDIA);
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [schedules, setSchedules] = useState<ScheduleItem[]>(INITIAL_SCHEDULES);
  const [dynamicFeeds, setDynamicFeeds] = useState<DynamicFeedItem[]>(DYNAMIC_FEEDS);
  const [branches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [logs, setLogs] = useState<AuditLog[]>(AUDIT_LOGS);
  const [users] = useState<SystemUser[]>(SYSTEM_USERS);
  const [settings, setSettings] = useState<SignageSettings>(DEFAULT_SETTINGS);

  // Player state
  const [playerScreenId, setPlayerScreenId] = useState<string>(getInitialScreenId);
  const [playerPlaylistId, setPlayerPlaylistId] = useState<string>(getInitialPlaylistId);
  const [isSimulatingOffline, setIsSimulatingOffline] = useState<boolean>(false);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  // Modal states
  const [previewPlaylist, setPreviewPlaylist] = useState<Playlist | null>(null);
  const [selectedScreenForDetails, setSelectedScreenForDetails] = useState<ScreenDevice | null>(null);
  const [shareModalScreen, setShareModalScreen] = useState<ScreenDevice | null>(null);
  const [isAddScreenOpen, setIsAddScreenOpen] = useState<boolean>(false);
  const [isUploadMediaOpen, setIsUploadMediaOpen] = useState<boolean>(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState<boolean>(false);
  // Supabase connection state
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [isSyncingWithSupabase, setIsSyncingWithSupabase] = useState<boolean>(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Emergency Broadcast
  const [emergencyAlert, setEmergencyAlert] = useState<EmergencyBroadcast>({
    isActive: false,
    title: '',
    message: '',
    type: 'warning',
    soundAlert: false,
    bannerColor: '#dc2626',
  });

  const triggerEmergency = (title: string, message: string, type: EmergencyBroadcast['type'], soundAlert: boolean) => {
    setEmergencyAlert({
      isActive: true,
      title,
      message,
      type,
      soundAlert,
      activatedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      activatedBy: 'Administrador (Painel Geral)',
      bannerColor: type === 'evacuation' ? '#b91c1c' : '#ea580c',
    });
    showToast(`🚨 TRANSMISSÃO EMERGENCIAL DISPARADA PARA TODAS AS TELAS!`);
    
    // Add audit log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      user: 'Administrador',
      action: '🚨 Ativou Transmissão Emergencial',
      target: title,
      timestamp: 'Agora mesmo',
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const clearEmergency = () => {
    setEmergencyAlert(prev => ({ ...prev, isActive: false }));
    showToast(`Transmissão emergencial encerrada. As telas retomaram a programação normal.`);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      user: 'Administrador',
      action: 'Encerrou Transmissão Emergencial',
      target: 'Programação normal restabelecida',
      timestamp: 'Agora mesmo',
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Supabase real-time synchronization
  const syncWithSupabase = async () => {
    const creds = getSupabaseCredentials();
    if (!creds.url || !creds.key) {
      setIsSupabaseConnected(false);
      return;
    }

    setIsSyncingWithSupabase(true);
    try {
      const client = getSupabaseClient();
      if (!client) {
        setIsSupabaseConnected(false);
        setIsSyncingWithSupabase(false);
        return;
      }

      // Fetch real data from Supabase tables in parallel
      const [realScreens, realMedia, realPlaylists, realEmergency] = await Promise.all([
        fetchRealScreensFromSupabase(),
        fetchRealMediaFromSupabase(),
        fetchRealPlaylistsFromSupabase(),
        fetchRealEmergencyFromSupabase(),
      ]);

      if (realScreens && realScreens.length > 0) {
        setScreens(realScreens);
      }
      if (realMedia && realMedia.length > 0) {
        setMedia(realMedia);
      }
      if (realPlaylists && realPlaylists.length > 0) {
        setPlaylists(realPlaylists);
      }
      if (realEmergency) {
        setEmergencyAlert(realEmergency);
      }

      setIsSupabaseConnected(true);
    } catch (err: any) {
      console.error('Erro ao sincronizar com Supabase:', err);
    } finally {
      setIsSyncingWithSupabase(false);
    }
  };

  // On mount: check credentials and connect
  useEffect(() => {
    const creds = getSupabaseCredentials();
    if (creds.url && creds.key) {
      syncWithSupabase();
    }

    const client = getSupabaseClient();
    if (!client) return;

    // Supabase Realtime channel for live updates across displays
    const channel = client
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'screens' }, () => {
        fetchRealScreensFromSupabase().then(res => {
          if (res.length > 0) setScreens(res);
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_broadcasts' }, () => {
        fetchRealEmergencyFromSupabase().then(alert => {
          if (alert) setEmergencyAlert(alert);
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'playlists' }, () => {
        fetchRealPlaylistsFromSupabase().then(res => {
          if (res.length > 0) setPlaylists(res);
        });
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  const getPlayerUrl = (screenId?: string, playlistId?: string): string => {
    if (typeof window === 'undefined') return '';
    const base = window.location.origin + window.location.pathname;
    const targetScreen = screenId || playerScreenId || 'scr-1';
    const targetPlaylist = playlistId || playerPlaylistId;
    const url = new URL(base);
    url.searchParams.set('view', 'player');
    if (targetScreen) url.searchParams.set('screen', targetScreen);
    if (targetPlaylist) url.searchParams.set('playlist', targetPlaylist);
    return url.toString();
  };

  const openPlayerInNewTab = (screenId?: string, playlistId?: string) => {
    if (screenId) setPlayerScreenId(screenId);
    if (playlistId) setPlayerPlaylistId(playlistId);
    const url = getPlayerUrl(screenId, playlistId);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const copyPlayerLink = (screenId?: string, playlistId?: string) => {
    const url = getPlayerUrl(screenId, playlistId);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          showToast('🔗 Link do player copiado! Cole no navegador de qualquer TV ou dispositivo.');
        })
        .catch(() => {
          showToast(`Link do player: ${url}`);
        });
    } else {
      showToast(`Link do player: ${url}`);
    }
  };

  const openPlayer = (screenId?: string, playlistId?: string) => {
    if (screenId) setPlayerScreenId(screenId);
    if (playlistId) setPlayerPlaylistId(playlistId);
    openPlayerInNewTab(screenId, playlistId);
  };

  const exitPlayer = () => {
    setActiveView('dashboard');
  };

  const toggleSimulateOffline = () => {
    setIsSimulatingOffline(prev => {
      const next = !prev;
      if (next) {
        showToast('⚠️ Modo Sem Internet ativado! O Player continua reproduzindo via Cache Local sem interrupção.');
      } else {
        showToast('🌐 Internet restabelecida! Sincronizando novos pacotes e atualizando playlist...');
        setSyncNotification('Sincronizando 4 de 12 arquivos do servidor...');
        setTimeout(() => {
          setSyncNotification('Sincronização 100% concluída. Cache local atualizado.');
          setTimeout(() => setSyncNotification(null), 3000);
        }, 2200);
      }
      return next;
    });
  };

  const triggerRemoteSync = (screenId: string) => {
    setScreens(prev =>
      prev.map(s => {
        if (s.id === screenId) {
          return { ...s, status: 'syncing', syncProgress: 45 };
        }
        return s;
      })
    );
    showToast(`Comando enviado: Sincronização remota iniciada na tela ${screenId}`);
    setTimeout(() => {
      setScreens(prev =>
        prev.map(s => {
          if (s.id === screenId) {
            return { ...s, status: 'online', syncProgress: 100, lastPing: 'Há poucos segundos' };
          }
          return s;
        })
      );
      showToast(`Sincronização concluída com sucesso.`);
    }, 2500);
  };

  const triggerRemoteReboot = (screenId: string) => {
    setScreens(prev =>
      prev.map(s => {
        if (s.id === screenId) {
          return { ...s, status: 'updating' };
        }
        return s;
      })
    );
    showToast(`Comando de reinicialização remota enviado.`);
    setTimeout(() => {
      setScreens(prev =>
        prev.map(s => {
          if (s.id === screenId) {
            return { ...s, status: 'online', lastPing: 'Acabou de reiniciar' };
          }
          return s;
        })
      );
      showToast(`Tela reiniciada e online.`);
    }, 3000);
  };

  const updateSettings = (newSettings: Partial<SignageSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    showToast('Configurações salvas com sucesso.');
  };

  const addScreen = (screenData: Partial<ScreenDevice>) => {
    const newScreen: ScreenDevice = {
      id: `scr-${Date.now()}`,
      name: screenData.name || 'Nova TV Pareada',
      code: `MH-${Math.floor(1000 + Math.random() * 9000)}`,
      branchId: screenData.branchId || 'b-centro',
      branchName: screenData.branchName || 'Loja Centro (Hipermercado)',
      environment: screenData.environment || 'Entrada',
      status: 'online',
      lastPing: 'Agora',
      currentPlaylistId: 'pl-1',
      currentPlaylistName: 'Loja Centro — Programação Principal 24h',
      currentMediaTitle: 'Super Oferta: Festival de Carnes',
      syncProgress: 100,
      cacheUsedMB: 3200,
      cacheTotalMB: 16000,
      orientation: screenData.orientation || '16:9',
      volume: 30,
      brightness: 85,
      playerVersion: 'v2.4.1-rc3',
      os: 'Android TV 12',
      ipAddress: `192.168.10.${Math.floor(100 + Math.random() * 150)}`,
      resolution: '1920x1080 (Full HD)',
      cpuUsage: 15,
      ramUsage: 40,
      temperature: 38,
      operatingHours: { start: '06:00', end: '23:00', autoSleep: true },
      screenshotUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
      tags: ['Novo Dispositivo', 'Pareado'],
      ...screenData,
    };
    setScreens(prev => [newScreen, ...prev]);
    showToast(`Tela "${newScreen.name}" cadastrada e pareada com sucesso!`);
  };

  const updateScreen = (id: string, updates: Partial<ScreenDevice>) => {
    setScreens(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    showToast('Configurações da tela atualizadas.');
  };

  const deleteScreen = (id: string) => {
    setScreens(prev => prev.filter(s => s.id !== id));
    showToast('Tela removida do sistema.');
  };

  const addMedia = (item: Partial<MediaItem>) => {
    const newItem: MediaItem = {
      id: `m-${Date.now()}`,
      title: item.title || 'Novo Conteúdo Enviado',
      type: item.type || 'image',
      url: item.url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80',
      thumbnailUrl: item.thumbnailUrl || item.url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&q=80',
      durationSeconds: item.durationSeconds || 10,
      fileSizeBytes: item.fileSizeBytes || 2500000,
      dimensions: item.dimensions || '1920x1080',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      status: 'ready',
      tags: item.tags || ['Upload'],
      category: item.category || 'Promoção',
      audioEnabled: item.audioEnabled || false,
      transition: item.transition || 'fade',
      ...item,
    };
    setMedia(prev => [newItem, ...prev]);
    showToast(`Mídia "${newItem.title}" adicionada com sucesso!`);
  };

  const deleteMedia = (id: string) => {
    setMedia(prev => prev.filter(m => m.id !== id));
    showToast('Mídia removida da biblioteca.');
  };

  const updatePlaylist = (id: string, updates: Partial<Playlist>) => {
    setPlaylists(prev => prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)));
    showToast('Playlist atualizada e sincronizada.');
  };

  const addPlaylist = (pl: Partial<Playlist>) => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name: pl.name || 'Nova Playlist de Mídia',
      description: pl.description || 'Playlist criada pelo operador',
      items: pl.items || [],
      totalDurationSeconds: pl.totalDurationSeconds || 30,
      screenCount: 0,
      updatedAt: new Date().toISOString(),
      ...pl,
    };
    setPlaylists(prev => [newPl, ...prev]);
    showToast(`Playlist "${newPl.name}" criada com sucesso!`);
  };

  const duplicatePlaylist = (id: string) => {
    const existing = playlists.find(p => p.id === id);
    if (!existing) return;
    const duplicated: Playlist = {
      ...existing,
      id: `pl-${Date.now()}`,
      name: `${existing.name} (Cópia)`,
      screenCount: 0,
      updatedAt: new Date().toISOString(),
    };
    setPlaylists(prev => [duplicated, ...prev]);
    showToast(`Playlist duplicada com sucesso.`);
  };

  const deletePlaylist = (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
    showToast('Playlist excluída.');
  };

  return (
    <SignageContext.Provider
      value={{
        activeView,
        setActiveView,
        screens,
        media,
        playlists,
        schedules,
        dynamicFeeds,
        branches,
        logs,
        users,
        settings,
        updateSettings,
        emergencyAlert,
        triggerEmergency,
        clearEmergency,
        playerScreenId,
        playerPlaylistId,
        openPlayer,
        openPlayerInNewTab,
        copyPlayerLink,
        getPlayerUrl,
        shareModalScreen,
        setShareModalScreen,
        exitPlayer,
        isSimulatingOffline,
        toggleSimulateOffline,
        syncNotification,
        triggerRemoteSync,
        triggerRemoteReboot,
        previewPlaylist,
        setPreviewPlaylist,
        selectedScreenForDetails,
        setSelectedScreenForDetails,
        isAddScreenOpen,
        setIsAddScreenOpen,
        isUploadMediaOpen,
        setIsUploadMediaOpen,
        isCreatePlaylistOpen,
        setIsCreatePlaylistOpen,
        addScreen,
        updateScreen,
        deleteScreen,
        addMedia,
        deleteMedia,
        updatePlaylist,
        addPlaylist,
        deletePlaylist,
        duplicatePlaylist,
        toastMessage,
        showToast,
        isSupabaseConnected,
        isSyncingWithSupabase,
        syncWithSupabase,
      }}
    >
      {children}
    </SignageContext.Provider>
  );
};

export const useSignage = () => {
  const context = useContext(SignageContext);
  if (!context) {
    throw new Error('useSignage must be used within a SignageProvider');
  }
  return context;
};
