import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ScreenDevice, MediaItem, Playlist, Branch, EmergencyBroadcast } from '../types';
import { getScreenSlug } from './slug';

export function getSupabaseCredentials(): { url: string; key: string } {
  let envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  let envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('mediahub_supabase_url');
    const localKey = localStorage.getItem('mediahub_supabase_key');
    if (localUrl) envUrl = localUrl;
    if (localKey) envKey = localKey;
  }

  return {
    url: envUrl.trim(),
    key: envKey.trim(),
  };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      localStorage.setItem('mediahub_supabase_url', url.trim());
    } else {
      localStorage.removeItem('mediahub_supabase_url');
    }

    if (key && key.trim()) {
      localStorage.setItem('mediahub_supabase_key', key.trim());
    } else {
      localStorage.removeItem('mediahub_supabase_key');
    }
  }
}

let supabaseInstance: SupabaseClient | null = null;
let currentClientUrl = '';
let currentClientKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key) {
    supabaseInstance = null;
    currentClientUrl = '';
    currentClientKey = '';
    return null;
  }

  // Re-instantiate if credentials changed
  if (supabaseInstance && currentClientUrl === url && currentClientKey === key) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    currentClientUrl = url;
    currentClientKey = key;
    return supabaseInstance;
  } catch (err) {
    console.error('Falha ao inicializar cliente Supabase:', err);
    supabaseInstance = null;
    return null;
  }
}

export function resetSupabaseClient(): SupabaseClient | null {
  supabaseInstance = null;
  currentClientUrl = '';
  currentClientKey = '';
  return getSupabaseClient();
}

export interface SupabaseTestResult {
  success: boolean;
  message: string;
  count?: number;
  stats?: {
    mediaCount: number;
    playlistCount: number;
    playlistItemsCount: number;
    screensCount: number;
  };
}

export async function testSupabaseConnection(url?: string, key?: string): Promise<SupabaseTestResult> {
  const targetUrl = url || getSupabaseCredentials().url;
  const targetKey = key || getSupabaseCredentials().key;

  if (!targetUrl || !targetKey) {
    return { success: false, message: 'URL e Anon Key do Supabase são obrigatórios.' };
  }

  try {
    const testClient = createClient(targetUrl, targetKey);

    // Test querying media_items, playlists, screens, and branches
    const [mediaRes, plRes, itemsRes, screensRes] = await Promise.allSettled([
      testClient.from('media_items').select('id', { count: 'exact', head: true }),
      testClient.from('playlists').select('id', { count: 'exact', head: true }),
      testClient.from('playlist_items').select('id', { count: 'exact', head: true }),
      testClient.from('screens').select('id', { count: 'exact', head: true }),
    ]);

    // Check errors
    if (mediaRes.status === 'rejected' || (mediaRes.status === 'fulfilled' && mediaRes.value.error)) {
      const err = mediaRes.status === 'fulfilled' ? mediaRes.value.error : mediaRes.reason;
      if (err?.code === '42P01') {
        return {
          success: false,
          message: 'Conectado ao Supabase, mas as tabelas ainda não foram criadas. Copie e execute o script SQL no SQL Editor do Supabase.',
        };
      }
      return { success: false, message: `Erro ao consultar Supabase: ${err?.message || 'Falha de comunicação'}` };
    }

    const mediaCount = mediaRes.status === 'fulfilled' ? (mediaRes.value.count ?? 0) : 0;
    const playlistCount = plRes.status === 'fulfilled' ? (plRes.value.count ?? 0) : 0;
    const itemsCount = itemsRes.status === 'fulfilled' ? (itemsRes.value.count ?? 0) : 0;
    const screensCount = screensRes.status === 'fulfilled' ? (screensRes.value.count ?? 0) : 0;

    return {
      success: true,
      message: `Conexão bem-sucedida! Encontradas ${mediaCount} mídias, ${playlistCount} playlists (${itemsCount} vínculos) e ${screensCount} telas.`,
      count: mediaCount,
      stats: {
        mediaCount,
        playlistCount,
        playlistItemsCount: itemsCount,
        screensCount,
      },
    };
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

  // Get playlists to resolve playlist name
  const { data: playlistsData } = await client.from('playlists').select('id, name');
  const playlistNameMap = new Map<string, string>();
  if (playlistsData) {
    playlistsData.forEach((p: any) => playlistNameMap.set(p.id, p.name));
  }

  return data.map((row: any): ScreenDevice => {
    const playlistId = row.current_playlist_id || 'pl-1';
    const playlistName = playlistNameMap.get(playlistId) || 'Playlist Principal';

    return {
      id: row.id,
      code: row.code,
      name: row.name,
      slug: row.slug || getScreenSlug(row),
      branchId: row.branch_id || 'b-centro',
      branchName: 'Matriz / Unidade Central',
      environment: row.environment || 'Geral',
      status: row.status || 'offline',
      lastPing: row.last_ping ? new Date(row.last_ping).toLocaleTimeString('pt-BR') : 'Recentemente',
      currentPlaylistId: playlistId,
      currentPlaylistName: playlistName,
      currentMediaTitle: row.current_media_title || 'Nenhuma mídia ativa',
      syncProgress: row.sync_progress ?? 100,
      cacheUsedMB: Number(row.cache_used_mb) || 2000,
      cacheTotalMB: Number(row.cache_total_mb) || 16000,
      orientation: row.orientation || '16:9',
      volume: row.volume ?? 80,
      brightness: row.brightness ?? 100,
      playerVersion: row.player_version || 'v3.8.4',
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
      tags: row.tags || ['Nuvem', 'Supabase'],
    };
  });
}

export async function fetchRealMediaFromSupabase(): Promise<MediaItem[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  const { data, error } = await client.from('media_items').select('*').eq('in_trash', false).order('created_at', { ascending: false });
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
    tags: row.tags || ['Nuvem'],
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

  // Fetch all media items as a dictionary
  const { data: mediaData } = await client.from('media_items').select('*');
  const mediaMap = new Map<string, MediaItem>();
  if (mediaData) {
    mediaData.forEach((m: any) => {
      mediaMap.set(m.id, {
        id: m.id,
        title: m.title,
        type: m.type || 'image',
        url: m.url,
        thumbnailUrl: m.thumbnail_url || m.url,
        durationSeconds: m.duration_seconds || 10,
        fileSizeBytes: Number(m.file_size_bytes) || 1000000,
        dimensions: m.dimensions || '1920x1080',
        createdAt: m.created_at,
        updatedAt: m.updated_at,
        status: m.status || 'ready',
        tags: m.tags || [],
        category: m.category || 'Geral',
        audioEnabled: m.audio_enabled ?? false,
        transition: m.transition || 'fade',
      });
    });
  }

  // Fetch playlist_items with order
  const { data: itemsData } = await client
    .from('playlist_items')
    .select('*')
    .order('item_order', { ascending: true });

  // Get screen count per playlist
  const { data: screensData } = await client.from('screens').select('current_playlist_id');
  const screenCountMap = new Map<string, number>();
  if (screensData) {
    screensData.forEach((s: any) => {
      if (s.current_playlist_id) {
        screenCountMap.set(s.current_playlist_id, (screenCountMap.get(s.current_playlist_id) || 0) + 1);
      }
    });
  }

  return playlistsData.map((pl: any): Playlist => {
    const rawItems = (itemsData || []).filter((it: any) => it.playlist_id === pl.id);

    const plItems = rawItems.map((it: any, idx: number) => {
      const mediaItem = mediaMap.get(it.media_id);
      return {
        id: it.id,
        mediaId: it.media_id,
        order: it.item_order ?? idx + 1,
        customDurationSeconds: it.custom_duration_seconds,
        audioEnabled: it.audio_enabled ?? false,
        transition: it.transition || 'fade',
        media: mediaItem,
      };
    });

    const totalDur = pl.total_duration_seconds || plItems.reduce((acc: number, cur: any) => {
      return acc + (cur.customDurationSeconds || cur.media?.durationSeconds || 10);
    }, 0);

    return {
      id: pl.id,
      name: pl.name,
      description: pl.description || '',
      branchId: pl.branch_id,
      isDefault: pl.is_default ?? false,
      isFallback: pl.is_fallback ?? false,
      items: plItems,
      totalDurationSeconds: totalDur,
      screenCount: screenCountMap.get(pl.id) || 1,
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
// SINCRONIZAÇÃO TOTAL: ENVIO DE MÍDIAS, PLAYLISTS, ITENS E TELAS
// -------------------------------------------------------------

export interface SyncStats {
  branchesCount: number;
  mediaCount: number;
  playlistsCount: number;
  itemsCount: number;
  screensCount: number;
}

export async function uploadLocalDataToSupabase(
  screens: ScreenDevice[],
  media: MediaItem[],
  playlists: Playlist[],
  branches?: Branch[]
): Promise<{ success: boolean; message: string; stats?: SyncStats }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, message: 'Supabase não conectado. Insira as credenciais primeiro.' };

  try {
    // 1. Filiais (Branches)
    if (branches && branches.length > 0) {
      for (const b of branches) {
        await client.from('branches').upsert(
          {
            id: b.id,
            name: b.name,
            city: b.city,
            state: b.state,
            manager: b.manager,
          },
          { onConflict: 'id' }
        );
      }
    }

    // 2. Mídias (media_items) - Salva todas com seus IDs e propriedades completas
    for (const m of media) {
      const { error: mediaErr } = await client.from('media_items').upsert(
        {
          id: m.id,
          title: m.title,
          type: m.type,
          url: m.url,
          thumbnail_url: m.thumbnailUrl || m.url,
          duration_seconds: m.durationSeconds,
          file_size_bytes: m.fileSizeBytes,
          dimensions: m.dimensions,
          category: m.category,
          tags: m.tags,
          audio_enabled: m.audioEnabled ?? false,
          transition: m.transition || 'fade',
          in_trash: false,
        },
        { onConflict: 'id' }
      );
      if (mediaErr) {
        throw new Error(`Erro ao sincronizar mídia "${m.title}": ${mediaErr.message}`);
      }
    }

    // 3. Playlists (playlists)
    for (const p of playlists) {
      const { error: plErr } = await client.from('playlists').upsert(
        {
          id: p.id,
          name: p.name,
          description: p.description,
          branch_id: p.branchId,
          is_default: p.isDefault ?? false,
          is_fallback: p.isFallback ?? false,
          total_duration_seconds: p.totalDurationSeconds,
        },
        { onConflict: 'id' }
      );
      if (plErr) {
        throw new Error(`Erro ao sincronizar playlist "${p.name}": ${plErr.message}`);
      }
    }

    // 4. VÍNCULO MÍDIA-PLAYLIST (playlist_items)
    // Limpa os itens antigos das playlists selecionadas para manter ordem e integridade absoluta
    const playlistIds = playlists.map(p => p.id);
    if (playlistIds.length > 0) {
      await client.from('playlist_items').delete().in('playlist_id', playlistIds);
    }

    const playlistItemsToInsert: any[] = [];
    for (const p of playlists) {
      if (p.items && p.items.length > 0) {
        p.items.forEach((it, idx) => {
          playlistItemsToInsert.push({
            id: it.id || `pli-${p.id}-${idx + 1}`,
            playlist_id: p.id,
            media_id: it.mediaId,
            item_order: it.order ?? idx + 1,
            custom_duration_seconds: it.customDurationSeconds,
            audio_enabled: it.audioEnabled ?? false,
            transition: it.transition || 'fade',
          });
        });
      }
    }

    if (playlistItemsToInsert.length > 0) {
      const { error: itemsErr } = await client.from('playlist_items').insert(playlistItemsToInsert);
      if (itemsErr) {
        throw new Error(`Erro ao vincular mídias às playlists: ${itemsErr.message}`);
      }
    }

    // 5. Telas (screens) com slug e vínculo direto à playlist ativa
    // Buscar códigos de telas existentes no banco para resolver qualquer colisão de code único
    const { data: existingScreens } = await client.from('screens').select('id, code');
    const existingCodeToId = new Map<string, string>();
    if (existingScreens) {
      existingScreens.forEach((r: any) => existingCodeToId.set(r.code, r.id));
    }

    for (const s of screens) {
      const screenSlug = s.slug || getScreenSlug(s);

      // Se houver registro no banco com esse mesmo código mas com ID diferente, remove a colisão
      const conflictingId = existingCodeToId.get(s.code);
      if (conflictingId && conflictingId !== s.id) {
        await client.from('screens').delete().eq('id', conflictingId);
        existingCodeToId.delete(s.code);
      }

      const { error: screenErr } = await client.from('screens').upsert(
        {
          id: s.id,
          code: s.code,
          name: s.name,
          slug: screenSlug,
          branch_id: s.branchId,
          environment: s.environment,
          status: s.status,
          current_playlist_id: s.currentPlaylistId || 'pl-1',
          current_media_title: s.currentMediaTitle,
          sync_progress: s.syncProgress ?? 100,
          cache_used_mb: s.cacheUsedMB ?? 2000,
          cache_total_mb: s.cacheTotalMB ?? 16000,
          orientation: s.orientation ?? '16:9',
          volume: s.volume ?? 80,
          brightness: s.brightness ?? 100,
          player_version: s.playerVersion ?? 'v3.8.4',
          os: s.os ?? 'Android TV 12',
          ip_address: s.ipAddress ?? '192.168.1.100',
          resolution: s.resolution ?? '1920x1080 Full HD',
          cpu_usage: s.cpuUsage ?? 20,
          ram_usage: s.ramUsage ?? 40,
          temperature: s.temperature ?? 41.5,
          operating_start: s.operatingHours?.start || '07:00',
          operating_end: s.operatingHours?.end || '22:00',
          auto_sleep: s.operatingHours?.autoSleep ?? true,
          screenshot_url: s.screenshotUrl,
          tags: s.tags || [],
        },
        { onConflict: 'id' }
      );
      if (screenErr) {
        throw new Error(`Erro ao sincronizar tela "${s.name}": ${screenErr.message}`);
      }
      existingCodeToId.set(s.code, s.id);
    }

    const stats: SyncStats = {
      branchesCount: branches?.length || 4,
      mediaCount: media.length,
      playlistsCount: playlists.length,
      itemsCount: playlistItemsToInsert.length,
      screensCount: screens.length,
    };

    return {
      success: true,
      message: `Sincronização total concluída com sucesso! ${stats.mediaCount} mídias, ${stats.playlistsCount} playlists (${stats.itemsCount} itens vinculados) e ${stats.screensCount} telas sincronizadas.`,
      stats,
    };
  } catch (err: any) {
    return { success: false, message: `Erro na sincronização: ${err.message}` };
  }
}

// -------------------------------------------------------------
// VALIDAÇÃO E AUDITORIA DE VÍNCULOS
// -------------------------------------------------------------

export interface LinkValidationReport {
  valid: boolean;
  mediaCount: number;
  playlistsCount: number;
  playlistItemsCount: number;
  screensCount: number;
  screensWithoutPlaylist: string[];
  orphanedPlaylistItems: string[];
  issues: string[];
}

export async function validateSupabaseLinks(): Promise<LinkValidationReport> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      valid: false,
      mediaCount: 0,
      playlistsCount: 0,
      playlistItemsCount: 0,
      screensCount: 0,
      screensWithoutPlaylist: [],
      orphanedPlaylistItems: [],
      issues: ['Supabase não conectado'],
    };
  }

  try {
    const [mediaRes, plRes, itemsRes, screensRes] = await Promise.all([
      client.from('media_items').select('id, title'),
      client.from('playlists').select('id, name'),
      client.from('playlist_items').select('id, playlist_id, media_id'),
      client.from('screens').select('id, name, current_playlist_id'),
    ]);

    const mediaIds = new Set((mediaRes.data || []).map((m: any) => m.id));
    const playlistIds = new Set((plRes.data || []).map((p: any) => p.id));

    const screensWithoutPlaylist: string[] = [];
    (screensRes.data || []).forEach((scr: any) => {
      if (!scr.current_playlist_id || !playlistIds.has(scr.current_playlist_id)) {
        screensWithoutPlaylist.push(`${scr.name} (${scr.id})`);
      }
    });

    const orphanedPlaylistItems: string[] = [];
    (itemsRes.data || []).forEach((it: any) => {
      if (!mediaIds.has(it.media_id)) {
        orphanedPlaylistItems.push(`Item ${it.id} na Playlist ${it.playlist_id} (Mídia inexistente: ${it.media_id})`);
      }
      if (!playlistIds.has(it.playlist_id)) {
        orphanedPlaylistItems.push(`Item ${it.id} vinculado a playlist inexistente ${it.playlist_id}`);
      }
    });

    const issues: string[] = [];
    if (screensWithoutPlaylist.length > 0) {
      issues.push(`${screensWithoutPlaylist.length} tela(s) sem playlist válida vinculada.`);
    }
    if (orphanedPlaylistItems.length > 0) {
      issues.push(`${orphanedPlaylistItems.length} vínculo(s) de item sem mídia correspondente.`);
    }

    return {
      valid: issues.length === 0,
      mediaCount: mediaRes.data?.length || 0,
      playlistsCount: plRes.data?.length || 0,
      playlistItemsCount: itemsRes.data?.length || 0,
      screensCount: screensRes.data?.length || 0,
      screensWithoutPlaylist,
      orphanedPlaylistItems,
      issues,
    };
  } catch (err: any) {
    return {
      valid: false,
      mediaCount: 0,
      playlistsCount: 0,
      playlistItemsCount: 0,
      screensCount: 0,
      screensWithoutPlaylist: [],
      orphanedPlaylistItems: [],
      issues: [err.message || 'Erro ao validar vínculos'],
    };
  }
}
