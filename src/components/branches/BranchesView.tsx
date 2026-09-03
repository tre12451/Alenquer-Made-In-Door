import React from 'react';
import { Building2, MapPin, Tv, Plus, CheckCircle2, ArrowRight } from 'lucide-react';
import { useSignage } from '../../context/SignageContext';

export const BranchesView: React.FC = () => {
  const { branches, screens, setActiveView } = useSignage();

  return (
    <div id="branches-view-root" className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-100 font-['Space_Grotesk']">
            Estrutura Multiloja & Unidades
          </h2>
          <p className="text-xs lg:text-sm text-slate-400">
            Organize sua rede por matriz, filiais, franquias e setores internos de exibição
          </p>
        </div>

        <button
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md shadow-lg shadow-emerald-900/20 flex items-center gap-2 cursor-pointer transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar Nova Filial</span>
        </button>
      </div>

      {/* Branches Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map(b => {
          const branchScreens = screens.filter(s => s.branchId === b.id);
          const onlineCount = branchScreens.filter(s => s.status === 'online').length;

          return (
            <div
              key={b.id}
              className="p-6 rounded-xl bg-[#121214] border border-slate-800 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-100 font-['Space_Grotesk']">
                        {b.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {b.city}, {b.state}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                    {onlineCount}/{branchScreens.length} Telas Online
                  </span>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] text-slate-400 font-medium uppercase">
                    Ambientes Cadastrados:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {b.environments.map((env, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-[#0c0c0e] border border-slate-800 text-xs text-slate-300"
                      >
                        {env}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">{branchScreens.length} players instalados</span>
                <button
                  onClick={() => setActiveView('screens')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver telas desta unidade</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
