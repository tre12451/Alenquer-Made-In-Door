import React, { useState } from 'react';
import { CalendarDays, Plus, Clock, AlertCircle, CheckCircle2, Sliders, Calendar, Play } from 'lucide-react';
import { useSignage } from '../../context/SignageContext';

export const ScheduleView: React.FC = () => {
  const { schedules, playlists, screens } = useSignage();
  const [activeTab, setActiveTab] = useState<'dayparts' | 'calendar'>('dayparts');

  return (
    <div id="schedule-view-root" className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-100 font-['Space_Grotesk']">
            Agendamento Inteligente de Telas
          </h2>
          <p className="text-xs lg:text-sm text-slate-400">
            Defina horários de pico, faixas de horário (dayparts) e campanhas prioritárias com interrupção automática
          </p>
        </div>

        <button
          id="btn-create-schedule"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md shadow-lg shadow-emerald-900/20 flex items-center gap-2 cursor-pointer transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Criar Nova Programação</span>
        </button>
      </div>

      {/* Dayparts Visual Grid (Manhã, Almoço, Tarde, Noite) */}
      <div className="p-6 rounded-xl bg-[#121214] border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-['Space_Grotesk']">
              Programação por Faixas de Horário (Dayparts Diários)
            </h3>
            <p className="text-xs text-slate-400">
              Alternância automática das playlists ao longo do dia comercial
            </p>
          </div>
          <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            Escalonador Ativo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              slot: 'MANHÃ',
              hours: '08:00 às 12:00',
              playlist: 'Menu Board & Padaria Gourmet',
              badge: 'Segunda a Sexta',
              color: 'border-slate-800 bg-[#0c0c0e] text-amber-400',
              status: 'Concluído Hoje',
            },
            {
              slot: 'ALMOÇO (PICO)',
              hours: '12:00 às 14:00',
              playlist: 'Loja Centro — Programação Principal',
              badge: 'Todos os Dias',
              color: 'border-slate-800 bg-[#0c0c0e] text-cyan-400',
              status: 'Concluído Hoje',
            },
            {
              slot: 'TARDE',
              hours: '14:00 às 18:00',
              playlist: 'Loja Centro — Programação Principal',
              badge: 'Segunda a Sábado',
              color: 'border-emerald-500/30 bg-[#0c0c0e] text-emerald-400 ring-1 ring-emerald-500/20',
              status: 'Em Execução Agora',
              active: true,
            },
            {
              slot: 'NOITE & HAPPY HOUR',
              hours: '18:00 às 22:00',
              playlist: 'Totens Verticais & Adega',
              badge: 'Quinta a Domingo',
              color: 'border-slate-800 bg-[#0c0c0e] text-indigo-400',
              status: 'Próxima Programação',
            },
          ].map((part, i) => (
            <div
              key={i}
              className={`p-5 rounded-lg border ${part.color} relative flex flex-col justify-between space-y-4`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider">{part.slot}</span>
                  {part.active && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                  )}
                </div>
                <div className="text-lg font-bold font-['Space_Grotesk'] text-slate-100 mt-1">
                  {part.hours}
                </div>
                <p className="text-xs text-slate-300 font-medium mt-2 line-clamp-2">
                  Playlist: <strong className="text-slate-100">{part.playlist}</strong>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">{part.badge}</span>
                <span className="font-semibold text-slate-200">{part.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Campaigns List with Priorities */}
      <div className="p-6 rounded-xl bg-[#121214] border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100 font-['Space_Grotesk']">
          Regras de Agendamento Ativas ({schedules.length})
        </h3>

        <div className="space-y-3">
          {schedules.map(sch => (
            <div
              key={sch.id}
              className="p-4 rounded-lg bg-[#0c0c0e] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-100">{sch.name}</h4>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      sch.priority === 'urgente'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : sch.priority === 'alta'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Prioridade: {sch.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Playlist vinculada: <span className="text-slate-200 font-semibold">{sch.playlistName}</span> •
                  Horário: {sch.startTime} às {sch.endTime}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>{sch.targetScreenIds.includes('ALL') ? 'Todas as Telas da Rede' : `${sch.targetScreenIds.length} Telas Segmentadas`}</span>
                <span className="text-emerald-400 font-semibold">● Ativo</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
