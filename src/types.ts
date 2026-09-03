export type ScreenStatus = 'online' | 'offline' | 'syncing' | 'updating';
export type ScreenOrientation = '16:9' | '9:16' | '4:3' | 'custom';
export type MediaType = 'image' | 'video' | 'html' | 'web' | 'youtube' | 'widget' | 'rss';
export type TransitionType = 'fade' | 'slide' | 'zoom' | 'dissolve' | 'cut' | 'kenburns';
export type LayoutType = '1-zone' | '2-zones-split' | '3-zones-bottom-ticker' | '4-zones-bento';
export type UserRole = 'ADMINISTRADOR' | 'GERENTE' | 'EDITOR' | 'OPERADOR' | 'VISUALIZADOR';

export interface ScreenDevice {
  id: string;
  name: string;
  code: string;
  branchId: string;
  branchName: string;
  environment: string; // ex: Entrada, Açougue, Caixas
  status: ScreenStatus;
  lastPing: string;
  currentPlaylistId: string;
  currentPlaylistName: string;
  currentMediaTitle: string;
  syncProgress: number; // 0-100
  cacheUsedMB: number;
  cacheTotalMB: number;
  orientation: ScreenOrientation;
  volume: number; // 0-100
  brightness: number; // 0-100
  playerVersion: string;
  os: string;
  ipAddress: string;
  resolution: string;
  cpuUsage: number; // %
  ramUsage: number; // %
  temperature: number; // °C
  operatingHours: {
    start: string;
    end: string;
    autoSleep: boolean;
  };
  screenshotUrl: string;
  tags: string[];
}

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  url: string;
  thumbnailUrl: string;
  durationSeconds: number;
  fileSizeBytes: number;
  dimensions?: string;
  createdAt: string;
  updatedAt: string;
  status: 'ready' | 'processing' | 'error';
  tags: string[];
  category: 'Promoção' | 'Institucional' | 'Notícias' | 'Esportes' | 'Clima' | 'Entretenimento' | 'Saúde' | 'Geral';
  audioEnabled: boolean;
  transition: TransitionType;
  inTrash?: boolean;
}

export interface PlaylistItem {
  id: string;
  mediaId: string;
  media: MediaItem;
  order: number;
  customDurationSeconds?: number;
  audioEnabled: boolean;
  transition: TransitionType;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  items: PlaylistItem[];
  totalDurationSeconds: number;
  screenCount: number;
  branchId?: string;
  isDefault?: boolean;
  isFallback?: boolean;
  updatedAt: string;
}

export interface ScheduleItem {
  id: string;
  name: string;
  playlistId: string;
  playlistName: string;
  targetScreenIds: string[]; // or 'ALL'
  targetBranchId?: string;
  startDate: string;
  endDate: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  daysOfWeek: number[]; // 0=dom, 1=seg, ..., 6=sab
  priority: 'normal' | 'alta' | 'urgente';
  isActive: boolean;
}

export interface DynamicFeedItem {
  id: string;
  category: 'noticias' | 'esportes' | 'cinema' | 'saude' | 'clima' | 'economia';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  source: string;
  updatedAt: string;
  extraData?: Record<string, any>;
}

export interface EmergencyBroadcast {
  isActive: boolean;
  title: string;
  message: string;
  type: 'evacuation' | 'warning' | 'info' | 'weather_alert';
  activatedAt?: string;
  activatedBy?: string;
  soundAlert: boolean;
  bannerColor: string;
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  state: string;
  screenCount: number;
  onlineCount: number;
  manager: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  status: 'ativo' | 'inativo';
  lastAccess: string;
}

export interface SignageSettings {
  companyName: string;
  brandLogo: string;
  defaultVolume: number;
  silentModeByDefault: boolean;
  autoFullscreen: boolean;
  offlineCacheLimitGB: number;
  watchdogIntervalSeconds: number;
  fallbackPlaylistId: string;
  operatingTimeStart: string;
  operatingTimeEnd: string;
  theme: 'dark' | 'light';
  tickerDefaultText: string;
}
