import React from 'react';
import { BarChart3, Download, Calendar, CheckCircle2, FileText, ArrowUpRight } from 'lucide-react';
import { useSignage } from '../../context/SignageContext';

export const ReportsView: React.FC = () => {
  const { media, screens } = useSignage();

  const handleExport = (type: 'csv' | 'pdf') => {
    alert(`Relatório de Comprovação de Veiculação exportado com sucesso em formato ${type.toUpperCase()}!`);
  };

  return (
    <div id="reports-view-root" className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-100 font-['Space_Grotesk']">
            Analytics & Comprovação de Veiculação (Checking)
          </h2>
          <p className="text-xs lg:text-sm text-slate-400">
            Relatórios auditáveis de exibições, tempo no ar e comprovação fotográfica para anunciantes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="px-3.5 py-2 rounded-md bg-[#18181b] hover:bg-[#202024] text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-900/20 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Gerar Dossiê PDF</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#121214] border border-slate-800 space-y-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Inserções Auditadas (Mês)</span>
          <div className="text-2xl font-bold text-slate-100 font-['Space_Grotesk']">142.850</div>
          <p className="text-[11px] text-emerald-400 font-medium">99.8% de conformidade programada</p>
        </div>
        <div className="p-5 rounded-xl bg-[#121214] border border-slate-800 space-y-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Horas no Ar</span>
          <div className="text-2xl font-bold text-slate-100 font-['Space_Grotesk']">1.420 horas</div>
          <p className="text-[11px] text-slate-400">Média de 14h/dia por terminal</p>
        </div>
        <div className="p-5 rounded-xl bg-[#121214] border border-slate-800 space-y-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Anunciantes Ativos</span>
          <div className="text-2xl font-bold text-emerald-400 font-['Space_Grotesk']">8 Contratos</div>
          <p className="text-[11px] text-slate-400">Relatórios de checking automáticos</p>
        </div>
      </div>

      {/* Table: Media Performance Breakdown */}
      <div className="p-6 rounded-xl bg-[#121214] border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100 font-['Space_Grotesk']">
          Ranking de Exibições por Mídia
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0c0c0e] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Campanha / Mídia</th>
                <th className="py-3 px-4 font-semibold">Categoria</th>
                <th className="py-3 px-4 font-semibold">Total Exibições</th>
                <th className="py-3 px-4 font-semibold">Tempo no Ar</th>
                <th className="py-3 px-4 font-semibold">Telas Ativas</th>
                <th className="py-3 px-4 font-semibold">Comprovação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {media.slice(0, 6).map((m, idx) => (
                <tr key={m.id} className="hover:bg-[#18181b] transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img src={m.thumbnailUrl} alt={m.title} className="w-10 h-7 rounded-md object-cover border border-slate-800" />
                    <span className="font-semibold text-slate-100">{m.title}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{m.category}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-100">{(12400 - idx * 1800).toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono text-cyan-400">{(34.5 - idx * 4.2).toFixed(1)}h</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{12 - idx} telas</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Auditado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
