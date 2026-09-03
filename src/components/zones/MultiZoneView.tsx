import React, { useState } from 'react';
import { Layers, Layout, Play, Sliders, CheckCircle2 } from 'lucide-react';
import { useSignage } from '../../context/SignageContext';

export const MultiZoneView: React.FC = () => {
  const { openPlayer } = useSignage();
  const [selectedLayout, setSelectedLayout] = useState<'1-zone' | '2-zones' | '3-zones' | '4-zones'>('3-zones');

  return (
    <div id="multizone-view-root" className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-100 font-['Space_Grotesk']">
            Editor de Divisão de Tela (Multi-Zonas)
          </h2>
          <p className="text-xs lg:text-sm text-slate-400">
            Configure telas divididas com vídeo principal, barra lateral promocional e letreiro de rodapé
          </p>
        </div>

        <button
          onClick={() => openPlayer()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md shadow-lg shadow-emerald-900/20 flex items-center gap-2 cursor-pointer transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Testar Layout no Player</span>
        </button>
      </div>

      {/* Preset Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            id: '1-zone',
            name: '1 Zona (Tela Cheia)',
            desc: 'Vídeo ou imagem em 100% da resolução 16:9 / 4K',
            zonesCount: 1,
            preview: (
              <div className="w-full h-24 bg-slate-800/60 border border-slate-700/60 rounded-md flex items-center justify-center text-xs font-medium text-slate-200">
                Zona Principal (100%)
              </div>
            ),
          },
          {
            id: '2-zones',
            name: '2 Zonas (Vídeo + Lateral)',
            desc: 'Vídeo em 70% e carrossel de ofertas na coluna direita',
            zonesCount: 2,
            preview: (
              <div className="w-full h-24 flex gap-1">
                <div className="w-2/3 bg-slate-800/60 border border-slate-700/60 rounded-md flex items-center justify-center text-[10px] font-medium text-slate-200">
                  Principal (70%)
                </div>
                <div className="w-1/3 bg-cyan-900/30 border border-cyan-700/40 rounded-md flex items-center justify-center text-[10px] font-medium text-cyan-300">
                  Banner (30%)
                </div>
              </div>
            ),
          },
          {
            id: '3-zones',
            name: '3 Zonas (Padrão Profissional)',
            desc: 'Vídeo + Coluna lateral + Rodapé com ticker e clima',
            zonesCount: 3,
            preview: (
              <div className="w-full h-24 flex flex-col gap-1">
                <div className="flex-1 flex gap-1">
                  <div className="w-2/3 bg-slate-800/60 border border-slate-700/60 rounded-md flex items-center justify-center text-[10px] font-medium text-slate-200">
                    Principal
                  </div>
                  <div className="w-1/3 bg-cyan-900/30 border border-cyan-700/40 rounded-md flex items-center justify-center text-[10px] font-medium text-cyan-300">
                    Lateral
                  </div>
                </div>
                <div className="h-5 bg-emerald-900/30 border border-emerald-700/40 rounded flex items-center justify-center text-[8px] font-medium text-emerald-300">
                  Rodapé Ticker Marquee (10%)
                </div>
              </div>
            ),
          },
          {
            id: '4-zones',
            name: '4 Zonas (Menu Board / Quad)',
            desc: '4 blocos independentes para lanchonetes e preços',
            zonesCount: 4,
            preview: (
              <div className="w-full h-24 grid grid-cols-2 gap-1">
                <div className="bg-slate-800/60 border border-slate-700/60 rounded flex items-center justify-center text-[9px] font-medium text-slate-200">
                  Zona 1
                </div>
                <div className="bg-cyan-900/30 border border-cyan-700/40 rounded flex items-center justify-center text-[9px] font-medium text-cyan-300">
                  Zona 2
                </div>
                <div className="bg-purple-900/30 border border-purple-700/40 rounded flex items-center justify-center text-[9px] font-medium text-purple-300">
                  Zona 3
                </div>
                <div className="bg-emerald-900/30 border border-emerald-700/40 rounded flex items-center justify-center text-[9px] font-medium text-emerald-300">
                  Zona 4
                </div>
              </div>
            ),
          },
        ].map(preset => {
          const isSelected = selectedLayout === preset.id;
          return (
            <div
              key={preset.id}
              onClick={() => setSelectedLayout(preset.id as any)}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? 'bg-[#18181b] border-slate-600 shadow-md ring-1 ring-slate-600'
                  : 'bg-[#121214] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-100">{preset.name}</h4>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>

              {preset.preview}

              <p className="text-[11px] text-slate-400 leading-snug">{preset.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Interactive Zone Assignment Details */}
      <div className="p-6 rounded-xl bg-[#121214] border border-slate-800 space-y-5">
        <h3 className="text-base font-bold text-slate-100 font-['Space_Grotesk']">
          Configuração das Áreas do Layout ({selectedLayout.toUpperCase()})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[#0c0c0e] border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Zona 1 (Principal)</span>
            <p className="text-xs font-semibold text-slate-100">Playlist de Vídeos & Ofertas</p>
            <p className="text-[11px] text-slate-400">Dimensão: 1920x1080 (Proporção 16:9) • Áudio Habilitado</p>
          </div>

          <div className="p-4 rounded-lg bg-[#0c0c0e] border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-cyan-400 uppercase">Zona 2 (Coluna Lateral)</span>
            <p className="text-xs font-semibold text-slate-100">Carrossel de Banners & Clima</p>
            <p className="text-[11px] text-slate-400">Dimensão: 600x1080 • Transição Suave Fade</p>
          </div>

          <div className="p-4 rounded-lg bg-[#0c0c0e] border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-purple-400 uppercase">Zona 3 (Faixa Rodapé)</span>
            <p className="text-xs font-semibold text-slate-100">Letreiro Notícias G1 + Ticker Ofertas</p>
            <p className="text-[11px] text-slate-400">Dimensão: 2560x120 • Velocidade 40px/s</p>
          </div>
        </div>
      </div>
    </div>
  );
};
