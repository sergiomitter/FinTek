
import React from 'react';
// Fix: Import User type
import { User } from '../types';

// Fix: Add user prop
const Receivable: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Contas a Receber</h2>
          <p className="text-text-secondary text-sm mt-1">Gerencie suas entradas e previsões de recebimento.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-surface-highlight bg-white dark:bg-transparent text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined">download</span> Exportar
          </button>
          <button className="px-6 py-2.5 rounded-xl bg-primary text-background-dark font-black text-sm shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center gap-2">
            <span className="material-symbols-outlined">add</span> Novo Recebimento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Recebido Hoje', value: 'R$ 12.450,00', icon: 'calendar_today', trend: '15% vs ontem', color: 'primary' },
          { label: 'Pendente (Mês)', value: 'R$ 45.200,00', icon: 'hourglass_empty', trend: '12 faturas abertas', color: 'yellow-500' },
          { label: 'Vencidos', value: 'R$ 3.850,00', icon: 'warning', trend: 'Ação necessária', color: 'danger' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-surface-highlight p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 size-24 bg-slate-100 dark:bg-white/5 rounded-full blur-3xl group-hover:bg-slate-200 dark:group-hover:bg-white/10 transition-all"></div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <span className="text-text-secondary text-xs font-bold uppercase tracking-widest">{stat.label}</span>
              <div className={`size-10 rounded-xl flex items-center justify-center bg-${stat.color === 'primary' ? 'primary' : stat.color}/10 text-${stat.color === 'primary' ? 'primary' : stat.color}`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">{stat.value}</p>
            <p className={`mt-2 text-xs font-bold relative z-10 ${stat.color === 'danger' ? 'text-danger' : 'text-text-secondary'}`}>{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="xl:w-1/3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-highlight rounded-2xl p-8 shadow-2xl h-fit">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">edit_document</span> Novo Lançamento
          </h3>
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Descrição</label>
              <input className="h-12 w-full rounded-xl border border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-[#111813] px-4 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary" placeholder="Ex: Consultoria Mensal" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Cliente</label>
              <select className="h-12 w-full rounded-xl border border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-[#111813] px-4 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary appearance-none">
                <option disabled selected>Selecione o cliente...</option>
                <option>Tech Solutions Ltda</option>
                <option>Consultoria Alpha</option>
                <option>João da Silva (PF)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Empresa Destino</label>
              <select className="h-12 w-full rounded-xl border border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-[#111813] px-4 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary appearance-none">
                <option disabled selected>Selecione sua empresa...</option>
                <option>Tech Solutions LTDA</option>
                <option>Matriz Holding</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Banco para Crédito</label>
              <select className="h-12 w-full rounded-xl border border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-[#111813] px-4 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary appearance-none">
                <option disabled selected>Selecione a conta...</option>
                <option>Nubank - Operacional</option>
                <option>Itaú - Reserva</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Valor</label>
                <input className="h-12 w-full rounded-xl border border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-[#111813] px-4 text-slate-900 dark:text-white text-right" placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Vencimento</label>
                <input className="h-12 w-full rounded-xl border border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-[#111813] px-4 text-slate-900 dark:text-white" type="date" />
              </div>
            </div>
            <button className="w-full rounded-xl bg-primary py-4 text-sm font-black text-background-dark shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
              Salvar Recebimento
            </button>
          </form>
        </div>

        <div className="xl:w-2/3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-highlight rounded-2xl p-8 shadow-2xl overflow-hidden flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Últimos Lançamentos</h3>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-surface-highlight">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-surface-highlight/30 text-[10px] uppercase font-black text-text-secondary tracking-widest border-b border-slate-200 dark:border-surface-highlight">
                <tr>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Descrição</th>
                  <th className="px-6 py-5">Cliente</th>
                  <th className="px-6 py-5 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-surface-highlight text-text-secondary">
                <tr className="hover:bg-slate-50 dark:hover:bg-surface-highlight/10 transition-colors">
                  <td className="px-6 py-4"><span className="text-primary font-bold uppercase">RECEBIDO</span></td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">Consultoria TI - Junho</td>
                  <td className="px-6 py-4">Tech Solutions</td>
                  <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">R$ 4.500,00</td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-surface-highlight/10 transition-colors">
                  <td className="px-6 py-4"><span className="text-yellow-600 dark:text-yellow-500 font-bold uppercase">PENDENTE</span></td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">Venda Equips #442</td>
                  <td className="px-6 py-4">Industrias Omega</td>
                  <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">R$ 12.150,00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receivable;
