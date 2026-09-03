import React, { useState } from 'react';
import { QrCode, Tv, Radio, ArrowLeft, CheckCircle2, RefreshCw, Smartphone } from 'lucide-react';
import { useSignage } from '../../context/SignageContext';

export const PairingScreen: React.FC = () => {
  const { setActiveView, addScreen } = useSignage();
  const [pairingCode] = useState(() => `MH-${Math.floor(1000 + Math.random() * 9000)}`);
  const [isPaired, setIsPaired] = useState(false);

  const handleSimulatePairing = () => {
    setIsPaired(true);
    setTimeout(() => {
      addScreen({
        name: `TV Nova — Pareada via ${pairingCode}`,
        code: pairingCode,
        environment: 'Entrada Loja',
        branchName: 'Loja Centro (Hipermercado)',
      });
      setActiveView('screens');
    }, 1800);
  };

  return (
    <div
      id="pairing-screen-root"
      className="min-h-screen bg-[#09090b] text-slate-100 flex flex-col justify-between p-6 lg:p-12 select-none relative overflow-hidden font-sans"
    >
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-xl tracking-tight text-slate-100 font-['Space_Grotesk']">MEDIA HUB PLAYER</h2>
            <p className="text-xs text-slate-400">Digital Signage OS • v2.4.1</p>
          </div>
        </div>

        <button
          id="btn-pairing-back-admin"
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#18181b] hover:bg-[#202024] text-xs font-medium text-slate-300 border border-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Painel</span>
        </button>
      </div>

      {/* Center Pairing Card */}
      <div className="max-w-4xl w-full mx-auto my-auto py-8 z-10">
        {isPaired ? (
          <div className="text-center space-y-4 py-12 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-100 font-['Space_Grotesk']">
              TELA PAREADA COM SUCESSO!
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              O dispositivo foi registrado e sincronizado no Media Hub. Redirecionando para a lista de telas...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#121214] border border-slate-800 rounded-xl p-8 lg:p-12 shadow-2xl">
            {/* Left Column: Big Pairing Code */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider">
                <Tv className="w-3.5 h-3.5" />
                Aguardando Pareamento
              </span>

              <h1 className="text-3xl lg:text-4xl font-bold text-slate-100 font-['Space_Grotesk'] leading-tight">
                Vincule esta tela ao seu painel
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed">
                Acesse o painel web administrativo do <strong>Media Hub</strong>, acesse em <strong>Telas &gt; Adicionar Tela</strong> e informe o código de 6 dígitos abaixo.
              </p>

              <div className="p-6 rounded-lg bg-[#0c0c0e] border border-slate-800 text-center space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Código de Pareamento Único
                </span>
                <div className="text-4xl lg:text-5xl font-bold tracking-widest text-emerald-400 font-mono">
                  {pairingCode}
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-simulate-pairing-action"
                  onClick={handleSimulatePairing}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wide uppercase shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simular Pareamento Imediato</span>
                </button>
              </div>
            </div>

            {/* Right Column: QR Code Mobile Scanning */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-lg bg-[#0c0c0e] border border-slate-800 text-center space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Ou Escaneie com o Celular</span>
              </div>

              <div className="p-3 bg-white rounded-lg shadow-xl w-44 h-44 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://mediahub.signage/pair/${pairingCode}`}
                  alt="QR Code de Pareamento"
                  className="w-full h-full object-contain"
                />
              </div>

              <p className="text-[11px] text-slate-400 max-w-xs">
                Aponte a câmera do seu smartphone para abrir diretamente o assistente de vinculação.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 z-10 font-mono">
        <div className="flex items-center gap-4">
          <span>IP: 192.168.10.142</span>
          <span>•</span>
          <span>MAC: B4:8A:0A:71:3E:99</span>
          <span>•</span>
          <span>Resolução: 3840x2160 (4K UHD)</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Servidor de Sinalização Conectado (Websocket OK)</span>
        </div>
      </div>
    </div>
  );
};
