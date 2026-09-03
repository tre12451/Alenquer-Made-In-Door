import React, { useState } from 'react';
import { Clock, CloudSun, QrCode, Type, Trophy, Copy, CheckCircle2, Play } from 'lucide-react';
import { useSignage } from '../../context/SignageContext';

export const WidgetsView: React.FC = () => {
  const { openPlayer } = useSignage();
  const [qrDestination, setQrDestination] = useState('https://wa.me/5511999999999?text=QueroDesconto');
  const [tickerText, setTickerText] = useState(
    '🔥 Super Oferta do Dia: Filé Mignon R$ 44,90/kg • Chopp Artesanal em Dobro até as 20h • Baixe nosso App e ganhe 10% de Cashback!'
  );
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="widgets-view-root" className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-100 font-['Space_Grotesk']">
            Widgets & Componentes Interativos
          </h2>
          <p className="text-xs lg:text-sm text-slate-400">
            Enriqueça as telas com relógios sincronizados, previsão do tempo, QR codes e letreiros
          </p>
        </div>

        <button
          onClick={() => openPlayer()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md shadow-lg shadow-emerald-900/20 flex items-center gap-2 cursor-pointer transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Ver Widgets no Player</span>
        </button>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Clima & Tempo Widget */}
        <div className="p-6 rounded-xl bg-[#121214] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-slate-100 font-['Space_Grotesk']">
                Previsão do Tempo (Geo IP)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
              Ativo no Rodapé
            </span>
          </div>

          {/* Interactive Visual Preview */}
          <div className="p-5 rounded-lg bg-[#0c0c0e] border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CloudSun className="w-12 h-12 text-amber-300 animate-pulse" />
              <div>
                <span className="text-3xl font-bold text-slate-100 font-['Space_Grotesk']">24°C</span>
                <p className="text-xs text-slate-300">São Paulo, Brasil • Parcialmente Ensolarado</p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-400 space-y-0.5">
              <p>Umidade: 62%</p>
              <p>Vento: 14 km/h</p>
              <p className="text-cyan-400 font-medium">Mín 18°C / Máx 28°C</p>
            </div>
          </div>
        </div>

        {/* 2. Relógio Digital & Data */}
        <div className="p-6 rounded-xl bg-[#121214] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-slate-100 font-['Space_Grotesk']">
                Relógio Digital em Tempo Real
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
              Sincronizado NTP
            </span>
          </div>

          <div className="p-5 rounded-lg bg-[#0c0c0e] border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-4xl font-mono font-bold text-cyan-400 tracking-wider">
                14:35:18
              </div>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">
                Quarta-feira, 2 de Setembro de 2026
              </p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 rounded-md bg-[#18181b] border border-slate-800 text-xs text-slate-300 font-mono">
                GMT-03:00 (Brasília)
              </span>
            </div>
          </div>
        </div>

        {/* 3. Gerador de QR Code Dinâmico */}
        <div className="p-6 rounded-xl bg-[#121214] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-slate-100 font-['Space_Grotesk']">
                QR Code Dinâmico (Balcão / Menu / Promo)
              </h3>
            </div>
            <button
              onClick={handleCopyCode}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar URL'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-lg bg-[#0c0c0e] border border-slate-800">
            <div className="p-2.5 bg-white rounded-md shrink-0">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                  qrDestination
                )}`}
                alt="QR Code"
                className="w-24 h-24"
              />
            </div>
            <div className="w-full space-y-2">
              <label className="block text-[11px] font-medium text-slate-400">
                URL de Destino do QR Code na TV:
              </label>
              <input
                type="text"
                value={qrDestination}
                onChange={e => setQrDestination(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-slate-600 font-mono"
              />
              <p className="text-[10px] text-slate-500">
                O cliente escaneia direto da TV para pedir no balcão ou baixar ofertas.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Letreiro Digital / Ticker Marquee */}
        <div className="p-6 rounded-xl bg-[#121214] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-slate-100 font-['Space_Grotesk']">
                Faixa de Texto Corrido (Ticker Marquee)
              </h3>
            </div>
            <span className="text-xs text-indigo-400 font-medium">Rodapé Contínuo</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-[#0c0c0e] border border-slate-800 overflow-hidden relative">
              <div className="text-xs font-medium text-amber-300 truncate">
                {tickerText}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Editar Mensagem do Ticker:
              </label>
              <input
                type="text"
                value={tickerText}
                onChange={e => setTickerText(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-slate-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
