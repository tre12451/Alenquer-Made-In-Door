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
} from 'lucide-react';
import { useSignage } from '../../context/SignageContext';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  resetSupabaseClient,
  uploadLocalDataToSupabase,
} from '../../lib/supabase';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    screens,
    media,
    playlists,
    showToast,
    syncWithSupabase,
    isSupabaseConnected,
    isSyncingWithSupabase,
  } = useSignage();

  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);

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
      showToast('Conectado ao Supabase! Sincronizando dados...');
      await syncWithSupabase();
    }
  };

  const handlePullData = async () => {
    await syncWithSupabase();
  };

  const handlePushData = async () => {
    setIsUploading(true);
    const res = await uploadLocalDataToSupabase(screens, media, playlists);
    setIsUploading(false);
    if (res.success) {
      showToast(res.message);
      await syncWithSupabase();
    } else {
      setTestResult(res);
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
        className="w-full max-w-2xl bg-[#121215] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/20 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Sincronização com Supabase (Dados Reais)
                {isSupabaseConnected && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <Radio className="w-2.5 h-2.5 animate-pulse" /> Conectado & Realtime
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Conecte o MediaHub ao seu PostgreSQL no Supabase para sincronização em tempo real nas TVs.
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

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Credentials Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                Project URL (Supabase API URL)
              </label>
              <input
                id="input-supabase-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemplo.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181c] border border-slate-700 text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                Anon / Public API Key
              </label>
              <input
                id="input-supabase-key"
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181c] border border-slate-700 text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Encontre em: Supabase Dashboard &gt; Project Settings &gt; API</span>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1"
                >
                  Abrir Supabase <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          {/* Test connection result banner */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
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
              <div className="flex-1">
                <p className="font-semibold">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Sync actions buttons */}
          <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              id="btn-supabase-pull-real-data"
              onClick={handlePullData}
              disabled={isSyncingWithSupabase}
              className="p-3.5 rounded-xl bg-[#18181c] hover:bg-[#202026] border border-slate-700 text-left flex items-start gap-3 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                <DownloadCloud className={`w-4 h-4 ${isSyncingWithSupabase ? 'animate-bounce' : ''}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Carregar Dados Reais do Banco</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Lê todas as telas, mídias e playlists salvas no Supabase agora.
                </p>
              </div>
            </button>

            <button
              id="btn-supabase-push-local-data"
              onClick={handlePushData}
              disabled={isUploading}
              className="p-3.5 rounded-xl bg-[#18181c] hover:bg-[#202026] border border-slate-700 text-left flex items-start gap-3 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                <UploadCloud className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Popular Banco com Dados Iniciais</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Envia as mídias, playlists e telas de demonstração para suas tabelas.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0d0d10] flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {isSupabaseConnected ? (
              <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Sincronização Ativa em Tempo Real
              </span>
            ) : (
              <span>Modo Local (Insira credenciais para ativar o banco em nuvem)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Fechar
            </button>
            <button
              id="btn-supabase-save-connect"
              onClick={handleTestAndConnect}
              disabled={testing}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Testar & Sincronizar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
