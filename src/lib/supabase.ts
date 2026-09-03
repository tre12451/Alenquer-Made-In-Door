import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { ScreenDevice, MediaItem, Playlist, Branch, EmergencyBroadcast, SignageSettings } from '../types';

const STORAGE_KEY_URL = 'mediahub_supabase_url';
const STORAGE_KEY_KEY = 'mediahub_supabase_anon_key';

export function getSupabaseCredentials(): { url: string; key: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) || '' : '';

  return {
    url: storedUrl || envUrl,
    key: storedKey || envKey,
  };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
    else localStorage.removeItem(STORAGE_KEY_URL);

    if (key) localStorage.setItem(STORAGE_KEY_KEY, key.trim());
    else localStorage.removeItem(STORAGE_KEY_KEY);
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key) {
    supabaseInstance = null;
    return null;
  }

  try {
    if (!supabaseInstance) {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }
    return supabaseInstance;
  } catch (err) {
    console.error('Falha ao inicializar cliente Supabase:', err);
    return null;
  }
}

export function resetSupabaseClient(): SupabaseClient | null {
  supabaseInstance = null;
  return getSupabaseClient();
}

export async function testSupabaseConnection(url?: string, key?: string): Promise<{ success: boolean; message: string; count?: number }> {
  const targetUrl = url || getSupabaseCredentials().url;
  const targetKey = key || getSupabaseCredentials().key;

  if (!targetUrl || !targetKey) {
    return { success: false, message: 'URL e Anon Key do Supabase são obrigatórios.' };
  }

  try {
    const testClient = createClient(targetUrl, targetKey);
    const { data, error } = await testClient.from('branches').select('id').limit(1);

    if (error) {
      // If branches table error, check if connection is active
      if (error.code === '42P01') {
        return { success: false, message: 'Conexão estabelecida, mas as tabelas ainda não foram criadas. Execute o schema.sql no SQL Editor.' };
      }
      return { success: false, message: `Erro ao consultar Supabase: ${error.message}` };
    }

    return { success: true, message: 'Conectado com sucesso ao Supabase!', count: data?.length || 0 };
  } catch (err: any) {
    return { success: false, message: err.message || 'Falha de rede ao conectar ao Supabase.' };
  }
}

// -------------------------------------------------------------
// LEITURA DE DADOS REAIS DO SUPABASE
// -------------------------------------------------------------

export async function fetchRealScreensFromSupabase(): Promise<ScreenDevice[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client.from('screens').select('*');
  if (error || !data) {
    console.warn('Erro ao buscar telas do Supabase:', error);
    return [];
  }

  return data.map((row: any): ScreenDevice => ({
    id: row.id,
    code: row.code,
    name: row.name,
    branchId: row.branch_id || 'b1',
    branchName: 'Matriz Paulista',
    environment: row.environment || 'Geral',
    status: row.status || 'offline',
    lastPing: row.last_ping ? new Date(row.last_ping).toLocaleTimeString('pt-BR') : 'Recentemente',
    currentPlaylistId: row.current_playlist_id || 'pl-1',
    currentPlaylistName: 'Playlist Principal',
    currentMediaTitle: row.current_media_title || 'Nenhuma mídia ativa',
    syncProgress: row.sync_progress ?? 100,
    cacheUsedMB: Number(row.cache_used_mb) || 2000,
    cacheTotalMB: Number(row.cache_total_mb) || 16000,
    orientation: row.orientation || '16:9',
    volume: row.volume ?? 80,
    brightness: row.brightness ?? 100,
    playerVersion: row.player_version || 'v3.4.2',
    os: row.os || 'Android TV 12',
    ipAddress: row.ip_address || '192.168.1.100',
    resolution: row.resolution || '1920x1080 Full HD',
    cpuUsage: row.cpu_usage ?? 20,
    ramUsage: row.ram_usage ?? 40,
    temperature: Number(row.temperature) || 41.5,
    operatingHours: {
      start: row.operating_start || '07:00',
      end: row.operating_end || '22:00',
      autoSleep: row.auto_sleep ?? true,
    },
    screenshotUrl: row.screenshot_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
    tags: row.tags || ['Supabase', 'Realtime'],
  }));
}

export async function fetchRealMediaFromSupabase(): Promise<MediaItem[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client.from('media_items').select('*').eq('in_trash', false);
  if (error || !data) {
    console.warn('Erro ao buscar mídias do Supabase:', error);
    return [];
  }

  return data.map((row: any): MediaItem => ({
    id: row.id,
    title: row.title,
    type: row.type || 'image',
    url: row.url,
    thumbnailUrl: row.thumbnail_url || row.url,
    durationSeconds: row.duration_seconds || 10,
    fileSizeBytes: Number(row.file_size_bytes) || 1000000,
    dimensions: row.dimensions || '1920x1080',
    createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '2026-01-01',
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString().split('T')[0] : '2026-01-01',
    status: row.status || 'ready',
    tags: row.tags || ['Supabase'],
    category: row.category || 'Geral',
    audioEnabled: row.audio_enabled ?? false,
    transition: row.transition || 'fade',
  }));
}

export async function fetchRealPlaylistsFromSupabase(): Promise<Playlist[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data: playlistsData, error } = await client.from('playlists').select('*');
  if (error || !playlistsData) {
    console.warn('Erro ao buscar playlists do Supabase:', error);
    return [];
  }

  const { data: itemsData } = await client
    .from('playlist_items')
    .select('*, media_items(*)')
    .order('item_order', { ascending: true });

  return playlistsData.map((pl: any): Playlist => {
    const plItems = (itemsData || [])
      .filter((it: any) => it.playlist_id === pl.id)
      .map((it: any, idx: number) => ({
        id: it.id,
        mediaId: it.media_id,
        order: it.item_order ?? idx + 1,
        customDurationSeconds: it.custom_duration_seconds,
        audioEnabled: it.audio_enabled ?? false,
        transition: it.transition || 'fade',
        media: it.media_items
          ? {
              id: it.media_items.id,
              title: it.media_items.title,
              type: it.media_items.type,
              url: it.media_items.url,
              thumbnailUrl: it.media_items.thumbnail_url || it.media_items.url,
              durationSeconds: it.media_items.duration_seconds || 10,
              fileSizeBytes: Number(it.media_items.file_size_bytes) || 1000000,
              dimensions: it.media_items.dimensions || '1920x1080',
              createdAt: it.media_items.created_at,
              updatedAt: it.media_items.updated_at,
              status: it.media_items.status,
              tags: it.media_items.tags || [],
              category: it.media_items.category || 'Geral',
              audioEnabled: it.media_items.audio_enabled ?? false,
              transition: it.media_items.transition || 'fade',
            }
          : undefined,
      }));

    return {
      id: pl.id,
      name: pl.name,
      description: pl.description || '',
      items: plItems,
      totalDurationSeconds: pl.total_duration_seconds || plItems.reduce((acc: number, cur: any) => acc + (cur.customDurationSeconds || cur.media?.durationSeconds || 10), 0),
      screenCount: 1,
      updatedAt: pl.updated_at || new Date().toISOString(),
    };
  });
}

export async function fetchRealEmergencyFromSupabase(): Promise<EmergencyBroadcast | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from('emergency_broadcasts')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    isActive: data.is_active ?? false,
    title: data.title || '',
    message: data.message || '',
    type: data.type || 'warning',
    soundAlert: data.sound_alert ?? true,
    bannerColor: data.banner_color || '#DC2626',
    activatedAt: data.activated_at ? new Date(data.activated_at).toLocaleTimeString('pt-BR') : undefined,
    activatedBy: data.activated_by || 'Supabase Central',
  };
}

// -------------------------------------------------------------
// SINCRONIZAÇÃO DE DADOS LOCAIS PARA O SUPABASE (UPLOAD SEED)
// -------------------------------------------------------------

export async function uploadLocalDataToSupabase(
  screens: ScreenDevice[],
  media: MediaItem[],
  playlists: Playlist[]
): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, message: 'Supabase não conectado.' };

  try {
    // 1. Inserir Mídias
    for (const m of media) {
      await client.from('media_items').upsert({
        title: m.title,
        type: m.type,
        url: m.url,
        thumbnail_url: m.thumbnailUrl,
        duration_seconds: m.durationSeconds,
        file_size_bytes: m.fileSizeBytes,
        dimensions: m.dimensions,
        category: m.category,
        tags: m.tags,
        audio_enabled: m.audioEnabled,
        transition: m.transition,
        in_trash: false,
      });
    }

    // 2. Inserir Playlists
    for (const p of playlists) {
      await client.from('playlists').upsert({
        name: p.name,
        description: p.description,
        total_duration_seconds: p.totalDurationSeconds,
      });
    }

    // 3. Inserir Telas
    for (const s of screens) {
      await client.from('screens').upsert({
        code: s.code,
        name: s.name,
        environment: s.environment,
        status: s.status,
        current_media_title: s.currentMediaTitle,
        sync_progress: s.syncProgress,
        cache_used_mb: s.cacheUsedMB,
        cache_total_mb: s.cacheTotalMB,
        orientation: s.orientation,
        volume: s.volume,
        brightness: s.brightness,
        player_version: s.playerVersion,
        os: s.os,
        ip_address: s.ipAddress,
        resolution: s.resolution,
        cpu_usage: s.cpuUsage,
        ram_usage: s.ramUsage,
        temperature: s.temperature,
        auto_sleep: s.operatingHours?.autoSleep ?? true,
        screenshot_url: s.screenshotUrl,
        tags: s.tags,
      }, { onConflict: 'code' });
    }

    return { success: true, message: 'Dados sincronizados com sucesso para o banco de dados do Supabase!' };
  } catch (err: any) {
    return { success: false, message: `Erro na sincronização: ${err.message}` };
  }
}
