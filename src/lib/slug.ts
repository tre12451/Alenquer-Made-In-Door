import { ScreenDevice } from '../types';

/**
 * Normalizes text to a clean URL-friendly slug
 * e.g. "TV 01 — Entrada Principal" -> "tv-01-entrada-principal"
 */
export function slugify(text: string): string {
  if (!text) return 'nomedatela';
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-')     // non-alphanumeric to hyphen
    .replace(/^-+|-+$/g, '')          // trim hyphens
    || 'nomedatela';
}

/**
 * Gets or computes the slug for a given screen
 */
export function getScreenSlug(screen?: ScreenDevice | { name?: string; code?: string; slug?: string } | string | null): string {
  if (!screen) return 'nomedatela';
  if (typeof screen === 'string') {
    return slugify(screen);
  }
  if (screen.slug && screen.slug.trim()) {
    return slugify(screen.slug);
  }
  if (screen.name && screen.name.trim()) {
    return slugify(screen.name);
  }
  if (screen.code && screen.code.trim()) {
    return slugify(screen.code);
  }
  return 'nomedatela';
}

/**
 * Official Player Access Domain requested by user: login.com.br/nomedatela
 */
export const OFFICIAL_PLAYER_DOMAIN = 'login.com.br';

/**
 * Returns the official player access page URL as requested:
 * e.g. "https://login.com.br/nomedatela"
 */
export function getOfficialPlayerUrl(screen?: ScreenDevice | string | null, protocol = true): string {
  const slug = getScreenSlug(screen);
  const prefix = protocol ? 'https://' : '';
  return `${prefix}${OFFICIAL_PLAYER_DOMAIN}/${slug}`;
}

/**
 * Returns the short display string:
 * e.g. "login.com.br/nomedatela"
 */
export function getDisplayPlayerUrl(screen?: ScreenDevice | string | null): string {
  const slug = getScreenSlug(screen);
  return `${OFFICIAL_PLAYER_DOMAIN}/${slug}`;
}

/**
 * Returns the live runtime URL on current server/preview:
 * e.g. window.location.origin + "/?view=player&screen=scr-1" or "/nomedatela"
 */
export function getRuntimePlayerUrl(screenId?: string, playlistId?: string, slug?: string): string {
  if (typeof window === 'undefined') return '';
  const base = window.location.origin + window.location.pathname;
  const url = new URL(base);
  url.searchParams.set('view', 'player');
  if (screenId) url.searchParams.set('screen', screenId);
  if (playlistId) url.searchParams.set('playlist', playlistId);
  if (slug) url.searchParams.set('slug', slug);
  return url.toString();
}
