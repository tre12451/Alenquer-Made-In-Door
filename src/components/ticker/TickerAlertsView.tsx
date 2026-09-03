import React, { useState } from 'react';
import { AlertTriangle, Radio, BellRing, CheckCircle2, ShieldAlert, Play, X } from 'lucide-react';
import { useSignage } from '../../context/SignageContext';

export const TickerAlertsView: React.FC = () => {
  const { emergencyAlert, setEmergencyAlert, openPlayer } = useSignage();
  const [alertTitle, setAlertTitle] = useState('COMUNICADO URGENTE');
  const [alertMessage, setAlertMessage] = useState(
    'Atenção clientes e colaboradores: Por favor, dirijam-se com calma às saídas de emergência.'
  );
  const [alertType, setAlertType] = useState<'info' | 'warning' | 'danger'>('danger');

  const handleTrigger = () => {
    setEmergencyAlert({
      active: true,
      title: alertTitle,
      message: alertMessage,
      type: alertType,
    });
  };

  const handleDismiss = () => {
    setEmergencyAlert({
      active: false,
      title: '',
      message: '',
      type: 'info',
    });
  };

  return (
    <div id="ticker-alerts-root" className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-100 font-['Space_Grotesk']">
            Transmissão de Emergência & Avisos em Massa
          </h2>
          <p className="text-xs lg:text-sm text-slate-400">
            Interrompa imediatamente a programação regular de todas as telas em caso de incidentes ou comunicados
          </p>
        </div>

        {emergencyAlert.active ? (
          <button
            onClick={handleDismiss}
            className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/60 flex items-center gap-2 animate-pulse cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>CANCELAR TRANSMISSÃO DE EMERGÊNCIA</span>
          </button>
        ) : (
          <button
            onClick={handleTrigger}
            className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/50 flex items-center gap-2 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>DISPARAR ALERTA GLOBAL</span>
          </button>
        )}
      </div>

      {/* Emergency Active Banner */}
      {emergencyAlert.active && (
        <div className="p-6 rounded-xl bg-rose-950/40 border border-rose-500/60 text-white space-y-3 shadow-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-rose-400 animate-spin" />
            <span className="text-xs font-bold tracking-widest uppercase">
              TRANSMISSÃO DE EMERGÊNCIA ATIVA EM TODAS AS 12 TELAS
            </span>
          </div>
          <p className="text-base font-bold font-['Space_Grotesk']">{emergencyAlert.title}</p>
          <p className="text-xs text-rose-200">{emergencyAlert.message}</p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => openPlayer()}
              className="px-3.5 py-1.5 rounded-md bg-white text-slate-900 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Ver no Player</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-3.5 py-1.5 rounded-md bg-rose-800 hover:bg-rose-700 text-white font-semibold text-xs cursor-pointer"
            >
              Encerrar Agora
            </button>
          </div>
        </div>
      )}

      {/* Config Card */}
      <div className="p-6 rounded-xl bg-[#121214] border border-slate-800 space-y-5">
        <h3 className="text-base font-bold text-slate-100 font-['Space_Grotesk']">
          Configurar Mensagem de Transmissão Instantânea
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tipo de Alerta
            </label>
            <div className="flex items-center gap-2">
              {[
                { id: 'danger', label: 'Perigo / Evacuação (Vermelho)', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
                { id: 'warning', label: 'Atenção / Operacional (Amarelo)', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
                { id: 'info', label: 'Informativo Geral (Azul)', color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setAlertType(t.id as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer ${
                    alertType === t.id ? t.color : 'bg-[#18181b] text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Título do Alerta (Exibido em destaque)
            </label>
            <input
              type="text"
              value={alertTitle}
              onChange={e => setAlertTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-100 text-xs font-semibold focus:outline-none focus:border-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Mensagem Detalhada
            </label>
            <textarea
              rows={3}
              value={alertMessage}
              onChange={e => setAlertMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[#18181b] border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-slate-600"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleTrigger}
              className="px-5 py-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Transmitir Agora para Todas as Telas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
