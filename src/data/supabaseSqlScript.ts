export const SUPABASE_COMPLETE_SQL_SCHEMA = `-- ==============================================================================
-- MEDIAHUB DIGITAL SIGNAGE - SCHEMA SQL COMPLETO PARA O SUPABASE
-- PostgreSQL com Suporte Completo a Mídias, Playlists, Vínculos e Telas
-- Totalmente Idempotente: pode ser executado várias vezes sem erros.
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS ENUMERADOS (ENUMS)
DO $$ BEGIN
  CREATE TYPE screen_status AS ENUM ('online', 'offline', 'syncing', 'updating');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE screen_orientation AS ENUM ('16:9', '9:16', '4:3', 'custom');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE media_type AS ENUM ('image', 'video', 'html', 'web', 'youtube', 'widget', 'rss');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE transition_type AS ENUM ('fade', 'slide', 'zoom', 'dissolve', 'cut', 'kenburns');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ADMINISTRADOR', 'GERENTE', 'EDITOR', 'OPERADOR', 'VISUALIZADOR');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE schedule_priority AS ENUM ('normal', 'alta', 'urgente');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE emergency_type AS ENUM ('evacuation', 'warning', 'info', 'weather_alert');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. FUNÇÃO PARA ATUALIZAÇÃO AUTOMÁTICA DO CAMPO updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 4. TABELAS PRINCIPAIS (COM SUPORTE A UUIDs E IDs CUSTOMIZADOS 'm-1', 'pl-1')
-- ==============================================================================

-- FILIAIS / UNIDADES (Branches)
CREATE TABLE IF NOT EXISTS branches (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    manager VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PERFIS DE USUÁRIO (Compatível com Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'OPERADOR',
    avatar_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    last_access TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- BIBLIOTECA DE MÍDIAS (Media Items)
CREATE TABLE IF NOT EXISTS media_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(255) NOT NULL,
    type media_type NOT NULL DEFAULT 'image',
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER NOT NULL DEFAULT 10,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    dimensions VARCHAR(50) DEFAULT '1920x1080',
    status VARCHAR(30) NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'processing', 'error')),
    category VARCHAR(50) NOT NULL DEFAULT 'Geral',
    tags TEXT[] DEFAULT '{}',
    audio_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    transition transition_type NOT NULL DEFAULT 'fade',
    in_trash BOOLEAN NOT NULL DEFAULT FALSE,
    storage_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PLAYLISTS
CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    branch_id TEXT REFERENCES branches(id) ON DELETE SET NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_fallback BOOLEAN NOT NULL DEFAULT FALSE,
    total_duration_seconds INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ITENS DA PLAYLIST (VÍNCULO ENTRE PLAYLIST E MÍDIAS COM ORDENAÇÃO E DURAÇÃO)
CREATE TABLE IF NOT EXISTS playlist_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    media_id TEXT NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    item_order INTEGER NOT NULL DEFAULT 0,
    custom_duration_seconds INTEGER,
    audio_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    transition transition_type NOT NULL DEFAULT 'fade',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TELAS / TERMINAIS (Screens / Players com Suporte a Slug login.com.br/nomedatela)
CREATE TABLE IF NOT EXISTS screens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    branch_id TEXT REFERENCES branches(id) ON DELETE SET NULL,
    environment VARCHAR(100) NOT NULL DEFAULT 'Geral',
    status screen_status NOT NULL DEFAULT 'offline',
    last_ping TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_playlist_id TEXT REFERENCES playlists(id) ON DELETE SET NULL,
    current_media_title VARCHAR(255),
    sync_progress INTEGER NOT NULL DEFAULT 100 CHECK (sync_progress BETWEEN 0 AND 100),
    cache_used_mb NUMERIC(10, 2) NOT NULL DEFAULT 0,
    cache_total_mb NUMERIC(10, 2) NOT NULL DEFAULT 16000,
    orientation screen_orientation NOT NULL DEFAULT '16:9',
    volume INTEGER NOT NULL DEFAULT 80 CHECK (volume BETWEEN 0 AND 100),
    brightness INTEGER NOT NULL DEFAULT 100 CHECK (brightness BETWEEN 0 AND 100),
    player_version VARCHAR(50) DEFAULT 'v3.8.4',
    os VARCHAR(100) DEFAULT 'Android TV 12',
    ip_address VARCHAR(45) DEFAULT '192.168.1.100',
    resolution VARCHAR(50) DEFAULT '1920x1080 Full HD',
    cpu_usage INTEGER DEFAULT 15,
    ram_usage INTEGER DEFAULT 35,
    temperature NUMERIC(5, 1) DEFAULT 42.0,
    operating_start TIME DEFAULT '07:00:00',
    operating_end TIME DEFAULT '22:00:00',
    auto_sleep BOOLEAN DEFAULT TRUE,
    screenshot_url TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GARANTIA: Se a tabela screens já existia anteriormente no Supabase, adiciona a coluna slug imediatamente
ALTER TABLE screens ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE screens ADD COLUMN IF NOT EXISTS current_playlist_id TEXT;
ALTER TABLE screens ADD COLUMN IF NOT EXISTS current_media_title VARCHAR(255);
ALTER TABLE screens ADD COLUMN IF NOT EXISTS branch_id TEXT;

-- AGENDAMENTOS (Schedules)
CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    target_screen_ids TEXT[] DEFAULT '{}',
    target_branch_id TEXT REFERENCES branches(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME NOT NULL DEFAULT '08:00:00',
    end_time TIME NOT NULL DEFAULT '22:00:00',
    days_of_week INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
    priority schedule_priority NOT NULL DEFAULT 'normal',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ALERTA DE EMERGÊNCIA GLOBAL (Broadcast)
CREATE TABLE IF NOT EXISTS emergency_broadcasts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type emergency_type NOT NULL DEFAULT 'warning',
    sound_alert BOOLEAN NOT NULL DEFAULT TRUE,
    banner_color VARCHAR(30) NOT NULL DEFAULT '#DC2626',
    activated_at TIMESTAMPTZ,
    activated_by VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LOGS DE AUDITORIA & TELEMETRIA
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_name VARCHAR(150) NOT NULL,
    action VARCHAR(255) NOT NULL,
    target VARCHAR(255) NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CONFIGURAÇÕES GERAIS DO SISTEMA
CREATE TABLE IF NOT EXISTS system_settings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    company_name VARCHAR(255) NOT NULL DEFAULT 'MediaHub Digital Signage',
    brand_logo TEXT DEFAULT '',
    default_volume INTEGER NOT NULL DEFAULT 0,
    silent_mode_by_default BOOLEAN NOT NULL DEFAULT TRUE,
    auto_fullscreen BOOLEAN NOT NULL DEFAULT TRUE,
    offline_cache_limit_gb INTEGER NOT NULL DEFAULT 32,
    watchdog_interval_seconds INTEGER NOT NULL DEFAULT 15,
    fallback_playlist_id TEXT REFERENCES playlists(id) ON DELETE SET NULL,
    operating_time_start TIME NOT NULL DEFAULT '06:00:00',
    operating_time_end TIME NOT NULL DEFAULT '23:00:00',
    theme VARCHAR(20) NOT NULL DEFAULT 'dark',
    ticker_default_text TEXT DEFAULT 'Bem-vindo ao nosso estabelecimento. Confira as novidades.',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. TRIGGERS DE ATUALIZAÇÃO AUTOMÁTICA
-- ==============================================================================

DROP TRIGGER IF EXISTS trg_branches_updated_at ON branches;
CREATE TRIGGER trg_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_media_items_updated_at ON media_items;
CREATE TRIGGER trg_media_items_updated_at BEFORE UPDATE ON media_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_playlists_updated_at ON playlists;
CREATE TRIGGER trg_playlists_updated_at BEFORE UPDATE ON playlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_screens_updated_at ON screens;
CREATE TRIGGER trg_screens_updated_at BEFORE UPDATE ON screens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_schedules_updated_at ON schedules;
CREATE TRIGGER trg_schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_emergency_broadcasts_updated_at ON emergency_broadcasts;
CREATE TRIGGER trg_emergency_broadcasts_updated_at BEFORE UPDATE ON emergency_broadcasts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_system_settings_updated_at ON system_settings;
CREATE TRIGGER trg_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 6. ÍNDICES DE ALTA PERFORMANCE
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_screens_code ON screens(code);
CREATE INDEX IF NOT EXISTS idx_screens_slug ON screens(slug);
CREATE INDEX IF NOT EXISTS idx_screens_branch_id ON screens(branch_id);
CREATE INDEX IF NOT EXISTS idx_screens_status ON screens(status);
CREATE INDEX IF NOT EXISTS idx_screens_current_playlist ON screens(current_playlist_id);

CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist ON playlist_items(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_items_media ON playlist_items(media_id);
CREATE INDEX IF NOT EXISTS idx_playlist_items_order ON playlist_items(playlist_id, item_order);

CREATE INDEX IF NOT EXISTS idx_media_items_category ON media_items(category);
CREATE INDEX IF NOT EXISTS idx_media_items_trash ON media_items(in_trash);

CREATE INDEX IF NOT EXISTS idx_schedules_active_dates ON schedules(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ==============================================================================
-- 7. SUPABASE REALTIME (Atualização instantânea nas TVs e Telas)
-- ==============================================================================

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE screens;
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE emergency_broadcasts;
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE playlists;
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE playlist_items;
EXCEPTION WHEN others THEN null;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE media_items;
EXCEPTION WHEN others THEN null;
END $$;

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS PERMISSIVO PARA ANOM E AUTHENTICATED)
-- ==============================================================================

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Limpar políticas anteriores
DROP POLICY IF EXISTS "Acesso total publico e autenticado a media_items" ON media_items;
DROP POLICY IF EXISTS "Acesso total publico e autenticado a playlists" ON playlists;
DROP POLICY IF EXISTS "Acesso total publico e autenticado a playlist_items" ON playlist_items;
DROP POLICY IF EXISTS "Acesso total publico e autenticado a screens" ON screens;
DROP POLICY IF EXISTS "Acesso total publico e autenticado a branches" ON branches;
DROP POLICY IF EXISTS "Acesso total publico e autenticado a emergency_broadcasts" ON emergency_broadcasts;
DROP POLICY IF EXISTS "Acesso total publico e autenticado a schedules" ON schedules;
DROP POLICY IF EXISTS "Acesso total publico e autenticado a system_settings" ON system_settings;
DROP POLICY IF EXISTS "Acesso total publico e autenticado a audit_logs" ON audit_logs;

-- Políticas universais para permitir que a aplicação web e as TVs façam SELECT, INSERT, UPDATE e DELETE sem bloqueios
CREATE POLICY "Acesso total publico e autenticado a media_items" ON media_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total publico e autenticado a playlists" ON playlists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total publico e autenticado a playlist_items" ON playlist_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total publico e autenticado a screens" ON screens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total publico e autenticado a branches" ON branches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total publico e autenticado a emergency_broadcasts" ON emergency_broadcasts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total publico e autenticado a schedules" ON schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total publico e autenticado a system_settings" ON system_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso total publico e autenticado a audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 9. DADOS INICIAIS COMPLETOS (SEED COM TODAS AS MÍDIAS E VÍNCULOS)
-- ==============================================================================

-- Filiais
INSERT INTO branches (id, name, city, state, manager) VALUES
('b-matriz', 'Matriz Corporativa', 'São Paulo', 'SP', 'Carlos Andrade'),
('b-centro', 'Loja Centro (Hipermercado)', 'São Paulo', 'SP', 'Mariana Costa'),
('b-norte', 'Loja Zona Norte', 'São Paulo', 'SP', 'Roberto Lima'),
('b-shopping', 'Shopping Morumbi Totens', 'São Paulo', 'SP', 'Fernanda Souza')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  manager = EXCLUDED.manager;

-- Biblioteca de Mídias (Todas as mídias da aplicação)
INSERT INTO media_items (id, title, type, url, thumbnail_url, duration_seconds, file_size_bytes, dimensions, category, tags, audio_enabled, transition, in_trash) VALUES
('m-1', 'Super Oferta: Festival de Carnes & Churrasco', 'image', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&q=80', 10, 2450000, '1920x1080', 'Promoção', ARRAY['Supermercado', 'Promoção', 'Alimentação'], false, 'kenburns', false),
('m-2', 'Vídeo Institucional — 25 Anos de Tradição e Qualidade', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&q=80', 15, 18400000, '1920x1080', 'Institucional', ARRAY['Institucional', 'Vídeo', 'Marca'], true, 'fade', false),
('m-3', 'G1 Notícias do Dia: Economia e Tecnologia', 'rss', 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80', 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&q=80', 12, 1200000, '1920x1080', 'Notícias', ARRAY['Notícias', 'Automático', 'RSS'], false, 'slide', false),
('m-4', 'Esportes & Placar da Rodada: Brasileirão e Libertadores', 'widget', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&q=80', 12, 890000, '1920x1080', 'Esportes', ARRAY['Esportes', 'Futebol', 'Ao Vivo'], false, 'zoom', false),
('m-5', 'Estreias de Cinema: Ação e Animação nos Cinemas', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&q=80', 14, 14200000, '1920x1080', 'Entretenimento', ARRAY['Cinema', 'Trailers', 'Entretenimento'], false, 'dissolve', false),
('m-6', 'Saúde & Bem-Estar: 5 Dicas de Hidratação Diária', 'image', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&q=80', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&q=80', 8, 1890000, '1920x1080', 'Saúde', ARRAY['Saúde', 'Dicas', 'Bem-estar'], false, 'fade', false),
('m-7', 'Previsão do Tempo & Qualidade do Ar', 'widget', 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1200&q=80', 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=300&q=80', 10, 950000, '1920x1080', 'Clima', ARRAY['Clima', 'Widget', 'São Paulo'], false, 'slide', false),
('m-8', 'QR Code Exclusivo: Baixe o App do Clube de Vantagens', 'image', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&q=80', 10, 2100000, '1920x1080', 'Promoção', ARRAY['QR Code', 'App', 'Desconto'], false, 'kenburns', false),
('m-9', 'Menu Board Padaria & Cafeteria Gourmet', 'image', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80', 15, 3100000, '1920x1080', 'Promoção', ARRAY['Padaria', 'Menu', 'Preços'], false, 'fade', false),
('m-10', 'Cotações em Tempo Real: Dólar, Euro e Ibovespa', 'widget', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300&q=80', 10, 820000, '1920x1080', 'Geral', ARRAY['Economia', 'Câmbio', 'Widget'], false, 'cut', false)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  type = EXCLUDED.type,
  url = EXCLUDED.url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  duration_seconds = EXCLUDED.duration_seconds,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  audio_enabled = EXCLUDED.audio_enabled,
  transition = EXCLUDED.transition;

-- Playlists
INSERT INTO playlists (id, name, description, branch_id, is_default, is_fallback, total_duration_seconds) VALUES
('pl-1', 'Loja Centro — Programação Principal 24h', 'Sequência dinâmica padrão com ofertas, notícias, esportes, trailers e previsão climática.', 'b-centro', true, false, 89),
('pl-2', 'Menu Board & Padaria Gourmet', 'Tabela de preços dinâmica e combos promocionais para cafés e confeitarias.', 'b-centro', false, false, 45),
('pl-3', 'Totens Verticais 9:16 — Shopping & Entrada', 'Campanha de marketing institucional e catálogo de produtos otimizados para orientação vertical.', 'b-shopping', false, false, 42),
('pl-4', 'Playlist de Fallback (Offline Seguro)', 'Conteúdos essenciais armazenados 100% no cache local para reprodução garantida em caso de queda de rede.', 'b-matriz', false, true, 35)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  total_duration_seconds = EXCLUDED.total_duration_seconds;

-- VÍNCULO COMPLETO: Itens de Cada Playlist vinculados às Mídias correspondentes
INSERT INTO playlist_items (id, playlist_id, media_id, item_order, custom_duration_seconds, audio_enabled, transition) VALUES
-- Itens da Playlist pl-1
('pli-1', 'pl-1', 'm-1', 1, 10, false, 'kenburns'),
('pli-2', 'pl-1', 'm-2', 2, 15, true, 'fade'),
('pli-3', 'pl-1', 'm-3', 3, 12, false, 'slide'),
('pli-4', 'pl-1', 'm-4', 4, 12, false, 'zoom'),
('pli-5', 'pl-1', 'm-5', 5, 14, false, 'dissolve'),
('pli-6', 'pl-1', 'm-6', 6, 8, false, 'fade'),
('pli-7', 'pl-1', 'm-7', 7, 10, false, 'slide'),
('pli-8', 'pl-1', 'm-8', 8, 8, false, 'kenburns'),
-- Itens da Playlist pl-2
('pli-21', 'pl-2', 'm-9', 1, 15, false, 'fade'),
('pli-22', 'pl-2', 'm-1', 2, 15, false, 'slide'),
('pli-23', 'pl-2', 'm-8', 3, 15, false, 'zoom'),
-- Itens da Playlist pl-3
('pli-31', 'pl-3', 'm-8', 1, 12, false, 'kenburns'),
('pli-32', 'pl-3', 'm-3', 2, 15, false, 'fade'),
('pli-33', 'pl-3', 'm-7', 3, 15, false, 'slide'),
-- Itens da Playlist pl-4 (Fallback)
('pli-41', 'pl-4', 'm-1', 1, 15, false, 'fade'),
('pli-42', 'pl-4', 'm-6', 2, 10, false, 'fade'),
('pli-43', 'pl-4', 'm-8', 3, 10, false, 'fade')
ON CONFLICT (id) DO UPDATE SET
  playlist_id = EXCLUDED.playlist_id,
  media_id = EXCLUDED.media_id,
  item_order = EXCLUDED.item_order,
  custom_duration_seconds = EXCLUDED.custom_duration_seconds,
  audio_enabled = EXCLUDED.audio_enabled,
  transition = EXCLUDED.transition;

-- Telas / Terminais com seus slugs e vínculos diretos às Playlists
INSERT INTO screens (id, code, name, slug, branch_id, environment, status, current_playlist_id, current_media_title, sync_progress, cache_used_mb, cache_total_mb, orientation, volume, brightness, player_version, os, ip_address, resolution, cpu_usage, ram_usage, temperature, auto_sleep, screenshot_url, tags) VALUES
('scr-1', 'MH-9021', 'TV 01 — Loja Centro Entrada Principal', 'entrada-principal', 'b-centro', 'Entrada Principal', 'online', 'pl-1', 'Super Oferta: Festival de Carnes & Churrasco', 100, 3420, 16000, '16:9', 80, 100, 'v3.8.4', 'Android TV 12', '192.168.10.101', '3840x2160 4K UHD', 14, 38, 41.5, true, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80', ARRAY['4K', 'Entrada', 'Promoções']),
('scr-2', 'MH-9022', 'TV 02 — Loja Centro Setor Açougue', 'acougue-cortes', 'b-centro', 'Açougue & Cortes Nobres', 'online', 'pl-1', 'Vídeo Institucional — 25 Anos de Tradição', 100, 4850, 16000, '16:9', 0, 100, 'v3.8.4', 'Tizen OS 7.0 (Samsung)', '192.168.10.102', '3840x2160 4K UHD', 22, 45, 43.0, true, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80', ARRAY['Vitrine', 'Institucional', 'Sem Áudio']),
('scr-3', 'MH-9031', 'TV 03 — Loja Norte Setor Hortifrúti', 'hortifruti', 'b-norte', 'Hortifrúti', 'offline', 'pl-1', 'Previsão do Tempo & Qualidade do Ar', 88, 2840, 8000, '16:9', 15, 75, 'v3.8.4', 'Raspberry Pi 4', '192.168.20.12', '1920x1080 Full HD', 0, 0, 0, true, 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&q=80', ARRAY['Hortifruti', 'Offline']),
('scr-4', 'MH-9024', 'TV 04 — Loja Centro Linha de Caixas 01-08', 'linha-caixas', 'b-centro', 'Frente de Caixa', 'online', 'pl-1', 'G1 Notícias do Dia: Economia e Tecnologia', 100, 5100, 16000, '16:9', 0, 80, 'v3.8.4', 'Windows 11 IoT', '192.168.10.88', '1920x1080 Full HD', 22, 54, 44.0, true, 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80', ARRAY['Caixas', 'Mudo']),
('scr-5', 'MH-7710', 'Totem Vertical 01 — Shopping Morumbi Piso L1', 'totem-shopping-l1', 'b-shopping', 'Corredor Central L1', 'online', 'pl-3', 'QR Code Exclusivo: Baixe o App', 100, 3100, 32000, '9:16', 0, 100, 'v3.8.4', 'Android 13 Signage Touch', '10.0.12.105', '1080x1920 Vertical Full HD', 19, 44, 41.0, true, 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80', ARRAY['Vertical', 'Totem', 'Touch'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  slug = EXCLUDED.slug,
  current_playlist_id = EXCLUDED.current_playlist_id,
  environment = EXCLUDED.environment,
  status = EXCLUDED.status;

-- Configurações Globais Iniciais
INSERT INTO system_settings (id, company_name, default_volume, silent_mode_by_default, auto_fullscreen, offline_cache_limit_gb, fallback_playlist_id) VALUES
('sys-settings-1', 'MediaHub Digital Signage', 0, true, true, 32, 'pl-4')
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  fallback_playlist_id = EXCLUDED.fallback_playlist_id;

-- Alerta de Emergência Inativo Inicial
INSERT INTO emergency_broadcasts (id, is_active, title, message, type, banner_color) VALUES
('emerg-1', false, 'AVISO DE EVACUAÇÃO IMEDIATA', 'Por favor, dirija-se com calma à saída de emergência mais próxima.', 'evacuation', '#DC2626')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  message = EXCLUDED.message;
`;
