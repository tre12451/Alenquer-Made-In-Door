import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  ExternalLink,
  X,
  Key,
  Globe,
  Radio,
  Copy,
  Check,
  Code2,
  ShieldCheck,
  Layers,
  Film,
  Tv,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react';
import { useSignage } from '../../context/SignageContext';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  resetSupabaseClient,
  uploadLocalDataToSupabase,
  validateSupabaseLinks,
  LinkValidationReport,
  SupabaseTestResult,
} from '../../lib/supabase';
import { SUPABASE_COMPLETE_SQL_SCHEMA } from '../../data/supabaseSqlScript';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    screens,
    media,
    playlists,
    branches,
    showToast,
    syncWithSupabase,
    isSupabaseConnected,
    isSyncingWithSupabase,
  } = useSignage();

  const [activeTab, setActiveTab] = useState<'sync' | 'sql' | 'links'>('sync');
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<SupabaseTestResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Link validation state
  const [isValidatingLinks, setIsValidatingLinks] = useState(false);
  const [validationReport, setValidationReport] = useState<LinkValidationReport | null>(null);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setAnonKey(creds.key);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndConnect = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({ success: false, message: 'Preencha a URL e a Anon Key do seu projeto Supabase.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(url.trim(), anonKey.trim());
    setTesting(false);
    setTestResult(res);

    if (res.success) {
      saveSupabaseCredentials(url.trim(), anonKey.trim());
      resetSupabaseClient();
      showToast('Conectado ao Supabase com sucesso!');
      await syncWithSupabase();
    }
  };

  const handlePullData = async () => {
    await syncWithSupabase();
    showToast('Dados atualizados do Supabase com sucesso!');
  };

  const handleTotalSync = async () => {
    setIsUploading(true);
    const res = await uploadLocalDataToSupabase(screens, media, playlists, branches);
    setIsUploading(false);

    if (res.success) {
      showToast(res.message);
      setTestResult({
        success: true,
        message: res.message,
        stats: res.stats,
      });
      await syncWithSupabase();
      // Auto run link check
      checkLinks();
    } else {
      setTestResult({
        success: false,
        message: res.message,
      });
    }
  };

  const checkLinks = async () => {
    setIsValidatingLinks(true);
    const report = await validateSupabaseLinks();
    setValidationReport(report);
    setIsValidatingLinks(false);
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_COMPLETE_SQL_SCHEMA);
      setCopiedSql(true);
      showToast('SQL completo copiado para a área de transferência!');
      setTimeout(() => setCopiedSql(false), 3000);
    } catch {
      showToast('Selecione e copie o texto abaixo.');
    }
  };

  return (
    <div
      id="supabase-sync-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="supabase-sync-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-[#121215] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/30 via-transparent to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Sincronização com Supabase
                </h3>
                {isSupabaseConnected ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <Radio className="w-2.5 h-2.5 animate-pulse" /> Conectado & Ao Vivo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Aguardando Conexão
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Sincronize mídias, playlists, telas e valide todos os vínculos relacionais.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 bg-[#0d0d10] flex items-center gap-4 shrink-0">
          <button
            id="tab-btn-sync"
            onClick={() => setActiveTab('sync')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'sync'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Sincronização Total no Agora
          </button>

          <button
            id="tab-btn-links"
            onClick={() => {
              setActiveTab('links');
              checkLinks();
            }}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'links'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Checar & Validar Vínculos
          </button>

          <button
            id="tab-btn-sql"
            onClick={() => setActiveTab('sql')}
            className={`py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'sql'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            SQL Completo (Script PostgreSQL)
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: SYNC TOTAL */}
          {activeTab === 'sync' && (
            <>
              {/* Credentials Form */}
              <div className="space-y-4 bg-[#18181c]/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" /> Credenciais da API Supabase
                  </h4>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Abrir Dashboard Supabase <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Project URL (Supabase API URL)
                  </label>
                  <input
                    id="input-supabase-url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://seu-projeto.supabase.co"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121215] border border-slate-700 text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                    <span>Anon / Public API Key</span>
                    <span className="text-[10px] text-slate-400">Settings &gt; API &gt; Project API keys</span>
                  </label>
                  <input
                    id="input-supabase-key"
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121215] border border-slate-700 text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    id="btn-supabase-test-conn"
                    onClick={handleTestAndConnect}
                    disabled={testing}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    {testing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Testando Conexão...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> Testar & Salvar Conexão
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status Message / Banner */}
              {testResult && (
                <div
                  className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                    testResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">{testResult.message}</p>
                    {testResult.stats && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-slate-300">
                        <div className="bg-slate-900/60 p-2 rounded border border-emerald-500/20">
                          <span className="text-slate-400 block">Mídias:</span>
                          <strong className="text-white text-sm">{testResult.stats.mediaCount}</strong>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded border border-emerald-500/20">
                          <span className="text-slate-400 block">Playlists:</span>
                          <strong className="text-white text-sm">{testResult.stats.playlistCount}</strong>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded border border-emerald-500/20">
                          <span className="text-slate-400 block">Vínculos Mídia:</span>
                          <strong className="text-white text-sm">{testResult.stats.playlistItemsCount}</strong>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded border border-emerald-500/20">
                          <span className="text-slate-400 block">Telas:</span>
                          <strong className="text-white text-sm">{testResult.stats.screensCount}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ACTION: Sincronize no Agora Total */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-emerald-900/20 to-slate-900/50 border border-emerald-500/30 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold tracking-wider uppercase mb-1.5">
                      <Sparkles className="w-3 h-3 text-emerald-400" /> Ação Recomendada
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      Sincronizar no Agora Total com o Supabase
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Envia todas as mídias (vídeos, banners, widgets), todas as playlists, todos os vínculos com duração/ordem e as telas com seus respectivos links diretos (slugs).
                    </p>
                  </div>
                  <button
                    id="btn-supabase-sync-now-total"
                    onClick={handleTotalSync}
                    disabled={isUploading || isSyncingWithSupabase}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Sincronizando Tudo...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 text-white" /> SINCRONIZAR NO AGORA TOTAL
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-black/40 border border-emerald-500/20 text-slate-300">
                    <Film className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="block font-semibold text-white">{media.length} Mídias</span>
                      <span className="text-[10px] text-slate-400">Imagens, vídeos e widgets</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-black/40 border border-emerald-500/20 text-slate-300">
                    <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="block font-semibold text-white">{playlists.length} Playlists</span>
                      <span className="text-[10px] text-slate-400">Com sequenciamento completo</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-black/40 border border-emerald-500/20 text-slate-300">
                    <Tv className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="block font-semibold text-white">{screens.length} Telas Conectadas</span>
                      <span className="text-[10px] text-slate-400">Com slugs login.com.br/nomedatela</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Download Button */}
              <div className="flex justify-between items-center pt-2">
                <button
                  id="btn-pull-supabase-data"
                  onClick={handlePullData}
                  disabled={isSyncingWithSupabase}
                  className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <DownloadCloud className={`w-4 h-4 text-indigo-400 ${isSyncingWithSupabase ? 'animate-bounce' : ''}`} />
                  Baixar e Atualizar Dados Reais do Banco
                </button>

                <span className="text-[11px] text-slate-500">
                  Atualização automática via Supabase Realtime habilitada
                </span>
              </div>
            </>
          )}

          {/* TAB 2: AUDITORIA DE VÍNCULOS */}
          {activeTab === 'links' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Integridade dos Vínculos no Banco de Dados
                  </h4>
                  <p className="text-xs text-slate-400">
                    Verifica se cada tela aponta para uma playlist existente e se cada playlist possui suas mídias conectadas.
                  </p>
                </div>

                <button
                  id="btn-refresh-validation-links"
                  onClick={checkLinks}
                  disabled={isValidatingLinks}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isValidatingLinks ? 'animate-spin' : ''}`} />
                  Verificar Novamente
                </button>
              </div>

              {isValidatingLinks ? (
                <div className="p-8 text-center space-y-2">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Auditando integridade das tabelas e chaves estrangeiras...</p>
                </div>
              ) : validationReport ? (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-xl border flex items-center gap-3 ${
                      validationReport.valid
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    }`}
                  >
                    {validationReport.valid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    )}
                    <div>
                      <p className="font-bold text-xs">
                        {validationReport.valid
                          ? 'Vínculos 100% Íntegros e Validados!'
                          : 'Atenção aos vínculos encontrados'}
                      </p>
                      <p className="text-[11px] opacity-90 mt-0.5">
                        {validationReport.valid
                          ? 'Todas as telas possuem playlists ativas e todas as playlists apontam para mídias válidas no banco.'
                          : 'Alguns registros precisam ser sincronizados com o botão "Sincronizar no Agora Total".'}
                      </p>
                    </div>
                  </div>

                  {/* Vínculos Breakdown Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#18181c] border border-slate-800">
                      <span className="text-slate-400 text-[11px] block">Mídias no Supabase:</span>
                      <strong className="text-lg font-bold text-white">{validationReport.mediaCount}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-[#18181c] border border-slate-800">
                      <span className="text-slate-400 text-[11px] block">Playlists:</span>
                      <strong className="text-lg font-bold text-white">{validationReport.playlistsCount}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-[#18181c] border border-slate-800">
                      <span className="text-slate-400 text-[11px] block">Vínculos Mídia-Playlist:</span>
                      <strong className="text-lg font-bold text-emerald-400">{validationReport.playlistItemsCount}</strong>
                    </div>

                    <div className="p-3 rounded-xl bg-[#18181c] border border-slate-800">
                      <span className="text-slate-400 text-[11px] block">Telas Conectadas:</span>
                      <strong className="text-lg font-bold text-white">{validationReport.screensCount}</strong>
                    </div>
                  </div>

                  {/* Issues if any */}
                  {validationReport.issues.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/20 space-y-2">
                      <h5 className="text-xs font-semibold text-amber-300">Inconsistências encontradas:</h5>
                      <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                        {validationReport.issues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                      <button
                        onClick={handleTotalSync}
                        className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Corrigir e Sincronizar Tudo Automaticamente
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
                  <LinkIcon className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                  Clique em "Verificar Novamente" para auditar as conexões e chaves estrangeiras.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SQL SCHEMA COMPLETO */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    Script SQL Completo para Supabase (PostgreSQL)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Execute no <strong>SQL Editor</strong> do Supabase para criar as tabelas, índices, realtime, RLS e dados iniciais com mídias e vínculos.
                  </p>
                </div>

                <button
                  id="btn-copy-full-sql"
                  onClick={handleCopySql}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-lg shadow-emerald-900/30"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      COPIADO COM SUCESSO!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-white" />
                      COPIAR SQL COMPLETO
                    </>
                  )}
                </button>
              </div>

              {/* Instructions steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                <div className="p-2.5 rounded-lg bg-[#18181c] border border-slate-800 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</span>
                  <span>Acesse seu <strong>Dashboard Supabase</strong> e selecione o projeto.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#18181c] border border-slate-800 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">2</span>
                  <span>No menu lateral, clique em <strong>SQL Editor</strong> &gt; <strong>New query</strong>.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#18181c] border border-slate-800 flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">3</span>
                  <span>Cole o código abaixo e clique em <strong>Run</strong> (Ctrl+Enter).</span>
                </div>
              </div>

              {/* Syntax code container */}
              <div className="relative">
                <pre className="p-4 rounded-xl bg-[#09090c] border border-slate-800 text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-72 select-all leading-relaxed">
                  {SUPABASE_COMPLETE_SQL_SCHEMA}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-[#0d0d10] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Suporte a Slugs: <code>login.com.br/nomedatela</code>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Fechar
            </button>
            <button
              id="btn-footer-total-sync"
              onClick={handleTotalSync}
              disabled={isUploading}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
              Sincronizar no Agora Total
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
