import React from 'react';
import { Users, Shield, Plus, CheckCircle2, History } from 'lucide-react';
import { useSignage } from '../../context/SignageContext';

export const UsersView: React.FC = () => {
  const { auditLogs } = useSignage();

  const mockUsers = [
    {
      id: 'u-1',
      name: 'Carlos Mendes',
      email: 'carlos.mendes@floriano.com.br',
      role: 'Administrador Geral',
      unit: 'Todas as Unidades',
      status: 'Ativo',
    },
    {
      id: 'u-2',
      name: 'Mariana Duarte',
      email: 'mariana.duarte@floriano.com.br',
      role: 'Editor de Conteúdo',
      unit: 'Loja Centro & Loja Norte',
      status: 'Ativo',
    },
    {
      id: 'u-3',
      name: 'Roberto Silva',
      email: 'roberto.silva@floriano.com.br',
      role: 'Gerente de Loja',
      unit: 'Shopping Morumbi',
      status: 'Ativo',
    },
    {
      id: 'u-4',
      name: 'Agência Publicidade XYZ',
      email: 'midia@agenciaxyz.com.br',
      role: 'Operador / Anunciante',
      unit: 'Totens Publicitários',
      status: 'Ativo',
    },
  ];

  return (
    <div id="users-view-root" className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-100 font-['Space_Grotesk']">
            Controle de Acesso & Perfis de Usuários
          </h2>
          <p className="text-xs lg:text-sm text-slate-400">
            Gerencie permissões por nível (Admin, Gerente, Editor, Operador) e logs de auditoria
          </p>
        </div>

        <button
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md shadow-lg shadow-emerald-900/20 flex items-center gap-2 cursor-pointer transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Convidar Novo Usuário</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="p-6 rounded-xl bg-[#121214] border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100 font-['Space_Grotesk']">
          Usuários com Acesso ao Painel ({mockUsers.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0c0c0e] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Nome</th>
                <th className="py-3 px-4 font-semibold">E-mail</th>
                <th className="py-3 px-4 font-semibold">Perfil / Permissão</th>
                <th className="py-3 px-4 font-semibold">Unidade Vinculada</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {mockUsers.map(u => (
                <tr key={u.id} className="hover:bg-[#18181b] transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-100">{u.name}</td>
                  <td className="py-3 px-4 text-slate-400">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[11px] border border-slate-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{u.unit}</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">● {u.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log */}
      <div className="p-6 rounded-xl bg-[#121214] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="text-base font-bold text-slate-100 font-['Space_Grotesk']">
            Trilha de Auditoria Recente (Ações no Sistema)
          </h3>
        </div>

        <div className="space-y-2">
          {auditLogs.map(log => (
            <div
              key={log.id}
              className="p-3 rounded-lg bg-[#0c0c0e] border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-100">{log.action}:</span>
                <span className="text-slate-400">{log.details}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <span>Por: <strong className="text-slate-300 font-medium">{log.user}</strong></span>
                <span>•</span>
                <span className="font-mono text-[11px]">{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
