-- ==============================================================================
-- MEDIAHUB DIGITAL SIGNAGE - SUPABASE DATABASE SCHEMA
-- PostgreSQL / Supabase Migration Script
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tipos enumerados (Enums)
DO $$ BEGIN
  CREATE TYPE screen_status AS ENUM ('online', 'offline', 'syncing', 'updating');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE screen_orientation AS ENUM ('16:9', '9:16', '4:3', 'custom');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE media_type AS ENUM ('image', 'video', 'html', 'web', 'youtube', 'widget', 'rss');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE transition_type AS ENUM ('fade', 'slide', 'zoom', 'dissolve', 'cut', 'kenburns');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ADMINISTRADOR', 'GERENTE', 'EDITOR', 'OPERADOR', 'VISUALIZADOR');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE schedule_priority AS ENUM ('normal', 'alta', 'urgente');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE emergency_type AS ENUM ('evacuation', 'warning', 'info', 'weather_alert');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Função para atualização automática do campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 4. TABELAS PRINCIPAIS
-- ==============================================================================

-- FILIAIS / UNIDADES (Branches)
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_fallback BOOLEAN NOT NULL DEFAULT FALSE,
    total_duration_seconds INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ITENS DA PLAYLIST (Ordenação e Duração Customizada)
CREATE TABLE IF NOT EXISTS playlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    media_id UUID NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    item_order INTEGER NOT NULL DEFAULT 0,
    custom_duration_seconds INTEGER,
    audio_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    transition transition_type NOT NULL DEFAULT 'fade',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TELAS / TERMINAIS (Screens / Players)
CREATE TABLE IF NOT EXISTS screens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    environment VARCHAR(100) NOT NULL DEFAULT 'Geral',
    status screen_status NOT NULL DEFAULT 'offline',
    last_ping TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
    current_media_title VARCHAR(255),
    sync_progress INTEGER NOT NULL DEFAULT 100 CHECK (sync_progress BETWEEN 0 AND 100),
    cache_used_mb NUMERIC(10, 2) NOT NULL DEFAULT 0,
    cache_total_mb NUMERIC(10, 2) NOT NULL DEFAULT 16000,
    orientation screen_orientation NOT NULL DEFAULT '16:9',
    volume INTEGER NOT NULL DEFAULT 80 CHECK (volume BETWEEN 0 AND 100),
    brightness INTEGER NOT NULL DEFAULT 100 CHECK (brightness BETWEEN 0 AND 100),
    player_version VARCHAR(50) DEFAULT 'v3.4.2',
    os VARCHAR(100) DEFAULT 'Android TV 12',
    ip_address VARCHAR(45) DEFAULT '192.168.1.100',
    resolution VARCHAR(50) DEFAULT '3840x2160 4K',
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

-- AGENDAMENTOS (Schedules)
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    target_screen_ids UUID[] DEFAULT '{}',
    target_branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(150) NOT NULL,
    action VARCHAR(255) NOT NULL,
    target VARCHAR(255) NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CONFIGURAÇÕES GERAIS DO SISTEMA
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL DEFAULT 'MediaHub Digital Signage',
    brand_logo TEXT DEFAULT '',
    default_volume INTEGER NOT NULL DEFAULT 0,
    silent_mode_by_default BOOLEAN NOT NULL DEFAULT TRUE,
    auto_fullscreen BOOLEAN NOT NULL DEFAULT TRUE,
    offline_cache_limit_gb INTEGER NOT NULL DEFAULT 32,
    watchdog_interval_seconds INTEGER NOT NULL DEFAULT 15,
    fallback_playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL,
    operating_time_start TIME NOT NULL DEFAULT '06:00:00',
    operating_time_end TIME NOT NULL DEFAULT '23:00:00',
    theme VARCHAR(20) NOT NULL DEFAULT 'dark',
    ticker_default_text TEXT DEFAULT 'Bem-vindo ao nosso estabelecimento. Confira as promoções do dia nos caixas.',
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
CREATE INDEX IF NOT EXISTS idx_screens_branch_id ON screens(branch_id);
CREATE INDEX IF NOT EXISTS idx_screens_status ON screens(status);
CREATE INDEX IF NOT EXISTS idx_screens_current_playlist ON screens(current_playlist_id);

CREATE INDEX IF NOT EXISTS idx_playlist_items_playlist ON playlist_items(playlist_id);
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
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE emergency_broadcasts;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE playlists;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE playlist_items;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_object THEN null;
END $$;

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
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

-- Remove políticas anteriores caso o script seja executado novamente
DROP POLICY IF EXISTS "Leitura pública para players em screens" ON screens;
DROP POLICY IF EXISTS "Atualização de ping e telemetria pelas telas" ON screens;
DROP POLICY IF EXISTS "Leitura pública de playlists para players" ON playlists;
DROP POLICY IF EXISTS "Leitura pública de itens da playlist para players" ON playlist_items;
DROP POLICY IF EXISTS "Leitura pública de mídias para exibição" ON media_items;
DROP POLICY IF EXISTS "Leitura de alertas de emergência para todas as telas" ON emergency_broadcasts;
DROP POLICY IF EXISTS "Leitura de configurações gerais" ON system_settings;

DROP POLICY IF EXISTS "Usuários autenticados gerenciam branches" ON branches;
DROP POLICY IF EXISTS "Usuários autenticados gerenciam mídias" ON media_items;
DROP POLICY IF EXISTS "Usuários autenticados gerenciam playlists" ON playlists;
DROP POLICY IF EXISTS "Usuários autenticados gerenciam itens de playlist" ON playlist_items;
DROP POLICY IF EXISTS "Usuários autenticados gerenciam telas" ON screens;
DROP POLICY IF EXISTS "Usuários autenticados gerenciam agendamentos" ON schedules;
DROP POLICY IF EXISTS "Usuários autenticados gerenciam emergências" ON emergency_broadcasts;
DROP POLICY IF EXISTS "Usuários autenticados criam logs" ON audit_logs;
DROP POLICY IF EXISTS "Usuários autenticados leem logs" ON audit_logs;
DROP POLICY IF EXISTS "Usuários autenticados alteram configurações" ON system_settings;

-- Políticas de leitura pública/player (permite aos players e telas lerem as informações de exibição)
CREATE POLICY "Leitura pública para players em screens" ON screens FOR SELECT USING (true);
CREATE POLICY "Atualização de ping e telemetria pelas telas" ON screens FOR UPDATE USING (true);

CREATE POLICY "Leitura pública de playlists para players" ON playlists FOR SELECT USING (true);
CREATE POLICY "Leitura pública de itens da playlist para players" ON playlist_items FOR SELECT USING (true);
CREATE POLICY "Leitura pública de mídias para exibição" ON media_items FOR SELECT USING (in_trash = false);
CREATE POLICY "Leitura de alertas de emergência para todas as telas" ON emergency_broadcasts FOR SELECT USING (true);
CREATE POLICY "Leitura de configurações gerais" ON system_settings FOR SELECT USING (true);

-- Políticas administrativas (usuários autenticados podem gerenciar)
CREATE POLICY "Usuários autenticados gerenciam branches" ON branches FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Usuários autenticados gerenciam mídias" ON media_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Usuários autenticados gerenciam playlists" ON playlists FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Usuários autenticados gerenciam itens de playlist" ON playlist_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Usuários autenticados gerenciam telas" ON screens FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Usuários autenticados gerenciam agendamentos" ON schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Usuários autenticados gerenciam emergências" ON emergency_broadcasts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Usuários autenticados criam logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuários autenticados leem logs" ON audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados alteram configurações" ON system_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- 9. DADOS INICIAIS (SEED)
-- ==============================================================================

-- Filial Inicial
INSERT INTO branches (name, city, state, manager)
SELECT 'Matriz Paulista', 'São Paulo', 'SP', 'Carlos Eduardo'
WHERE NOT EXISTS (SELECT 1 FROM branches LIMIT 1);

-- Configurações Iniciais
INSERT INTO system_settings (company_name, default_volume, silent_mode_by_default, auto_fullscreen, offline_cache_limit_gb)
SELECT 'MediaHub Digital Signage', 0, true, true, 32
WHERE NOT EXISTS (SELECT 1 FROM system_settings LIMIT 1);

-- Alerta de Emergência Inativo Inicial
INSERT INTO emergency_broadcasts (is_active, title, message, type)
SELECT false, 'AVISO DE EVACUAÇÃO IMEDIATA', 'Por favor, dirija-se à saída de emergência mais próxima.', 'evacuation'
WHERE NOT EXISTS (SELECT 1 FROM emergency_broadcasts LIMIT 1);
