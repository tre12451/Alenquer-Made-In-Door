import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Tv,
  Share2,
  Sparkles,
  Globe,
  Edit3,
} from 'lucide-react';
import { useSignage } from '../../context/SignageContext';
import { getScreenSlug, slugify } from '../../lib/slug';

export const SharePlayerModal: React.FC = () => {
  const {
    shareModalScreen,
    setShareModalScreen,
    getOfficialPlayerUrl,
    getDisplayPlayerUrl,
    getRuntimePlayerUrl,
    updateScreenSlug,
  } = useSignage();

  const [copied, setCopied] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [customSlugInput, setCustomSlugInput] = useState('');

  if (!shareModalScreen) return null;

  const currentSlug = getScreenSlug(shareModalScreen);
  const officialUrl = getOfficialPlayerUrl(shareModalScreen.id);
  const displayUrl = getDisplayPlayerUrl(shareModalScreen.id);
  const runtimeUrl = getRuntimePlayerUrl(shareModalScreen.id, shareModalScreen.currentPlaylistId);

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(officialUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const handleOpenNewTab = () => {
    window.open(runtimeUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSaveSlug = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSlugInput.trim()) {
      const sanitized = slugify(customSlugInput.trim());
      updateScreenSlug(shareModalScreen.id, sanitized);
      setIsEditingSlug(false);
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(officialUrl)}`;

  return (
    <div
      id="modal-share-player-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
      onClick={() => setShareModalScreen(null)}
    >
      <div
        id="modal-share-player-content"
        onClick={(e) => e.stopPropagation()}
        className="bg-[#121214] border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Página de Acesso ao Player
              </span>
              <h3 className="text-xl font-bold text-slate-100 font-['Space_Grotesk']">
                login.com.br/{currentSlug}
              </h3>
            </div>
          </div>
          <button
            id="btn-close-share-modal"
            onClick={() => setShareModalScreen(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Screen Target Card */}
        <div className="p-3.5 rounded-lg bg-[#18181b] border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center text-indigo-400">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-100">{shareModalScreen.name}</p>
              <p className="text-[11px] text-slate-400">
                {shareModalScreen.environment} • {shareModalScreen.branchName}
              </p>
            </div>
          </div>
          <div className="text-right flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              PIN: {shareModalScreen.code}
            </span>
          </div>
        </div>

        {/* Official URL Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <label className="flex items-center gap-1.5 text-emerald-400">
              <Globe className="w-4 h-4" />
              <span>Link Oficial de Acesso:</span>
            </label>
            {!isEditingSlug ? (
              <button
                id="btn-edit-slug-toggle"
                onClick={() => {
                  setCustomSlugInput(currentSlug);
                  setIsEditingSlug(true);
                }}
                className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Editar slug</span>
              </button>
            ) : null}
          </div>

          {isEditingSlug ? (
            <form onSubmit={handleSaveSlug} className="space-y-2 p-3 bg-[#09090b] rounded-lg border border-indigo-500/30">
              <p className="text-[11px] text-slate-400">
                Defina o nome da tela na URL (ex: <b>nomedatela</b> ou <b>entrada-principal</b>):
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-500">login.com.br/</span>
                <input
                  type="text"
                  value={customSlugInput}
                  onChange={(e) => setCustomSlugInput(e.target.value)}
                  placeholder="nomedatela"
                  className="flex-1 px-3 py-1.5 bg-[#18181b] border border-slate-700 rounded-md text-xs font-mono text-emerald-300 focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold cursor-pointer"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingSlug(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-[#09090b] border border-slate-800 rounded-lg text-xs font-mono text-emerald-400 flex items-center gap-1 overflow-x-auto select-all">
                <span className="text-slate-500">https://</span>
                <span className="font-bold text-emerald-300">{displayUrl}</span>
              </div>
              <button
                id="btn-modal-copy-url"
                onClick={handleCopy}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons: Open New Tab & Copy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            id="btn-modal-open-new-tab"
            onClick={handleOpenNewTab}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Abrir Agora em Nova Guia</span>
          </button>

          <button
            id="btn-modal-copy-link-alt"
            onClick={handleCopy}
            className="w-full py-2.5 px-4 rounded-lg bg-[#18181b] hover:bg-[#202024] border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Copy className="w-4 h-4 text-emerald-400" />
            <span>Copiar Link Oficial</span>
          </button>
        </div>

        {/* QR Code & Smart TV Scan Section */}
        <div className="p-4 rounded-xl bg-[#09090b] border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-36 h-36 bg-white p-2 rounded-lg shadow-md shrink-0 flex items-center justify-center">
            <img
              src={qrCodeUrl}
              alt="QR Code do Player"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-[10px] font-semibold">
              <QrCode className="w-3 h-3 text-emerald-400" />
              <span>Acesso Direto</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-100">
              Escaneie ou digite na Smart TV
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              No navegador da TV ou TV Box, abra <strong className="text-emerald-300 font-mono">{displayUrl}</strong> para iniciar a reprodução contínua da tela em alta resolução sem barras administrativas.
            </p>
          </div>
        </div>

        {/* Step by step for Smart TV */}
        <div className="p-3.5 rounded-lg bg-[#18181b]/60 border border-slate-800/80 space-y-2 text-xs text-slate-300">
          <p className="font-semibold text-slate-200 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instruções para Smart TV / Painel:</span>
          </p>
          <ul className="space-y-1.5 text-slate-400 text-[11px] list-disc list-inside">
            <li>Abra o navegador da TV (Samsung Tizen, LG webOS ou Android TV).</li>
            <li>Digite o endereço: <b className="text-emerald-400 font-mono">{displayUrl}</b></li>
            <li>Pressione <b>F11</b> ou o botão de <b>Tela Cheia</b> no player para exibição imersiva.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
