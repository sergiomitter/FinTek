
import React from 'react';
// Fix: Import User type
import { User } from '../types';

// Fix: Add user prop
const Investments: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-200 dark:border-surface-highlight">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Carteira de Investimentos</h1>
          <p className="text-slate-600 dark:text-text-secondary text-base font-medium">Acompanhe a rentabilidade e evolução do seu patrimônio.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-highlight text-slate-900 dark:text-white font-black text-sm shadow-sm flex items-center gap-2 hover:border-primary transition-all">
            <span className="material-symbols-outlined">file_download</span> Exportar
          </button>
          <button className="px-8 py-3 rounded-xl bg-primary text-background-dark font-black text-sm shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] transition-all">
            <span className="material-symbols-outlined">add</span> Novo Aporte
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Investido', value: 'R$ 150.000,00', trend: '+2.5%', type: 'positive', icon: 'monetization_on' },
          { label: 'Valor Atualizado', value: 'R$ 168.450,00', trend: '+R$ 18.450,00', type: 'positive', icon: 'account_balance' },
          { label: 'Rentabilidade Geral', value: '12,3%', trend: '+0.8% vs CDI', type: 'positive', icon: 'percent' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-surface-dark rounded-2xl p-8 border border-slate-200 dark:border-surface-highlight shadow-sm hover:shadow-xl relative group overflow-hidden transition-all">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all relative z-0">
              <span className="material-symbols-outlined text-6xl text-primary">{stat.icon}</span>
            </div>
            <div className="relative z-10">
              <p className="text-slate-500 dark:text-[#9db9a6] text-[10px] font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">trending_up</span>
                <span className="text-primary font-black text-sm">{stat.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-4 bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-surface-highlight p-8 shadow-sm sticky top-24">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-surface-highlight pb-6 mb-8">
            <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-inner"><span className="material-symbols-outlined">add_chart</span></div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Novo Ativo</h3>
          </div>
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Empresa Vinculada</label>
              <select className="h-12 w-full rounded-xl border border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-[#111813] px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold appearance-none">
                <option disabled selected>Vincular a uma empresa...</option>
                <option>Tech Solutions LTDA</option>
                <option>Matriz Holding</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Instituição / Corretora</label>
              <select className="h-12 w-full rounded-xl border border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-[#111813] px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold appearance-none">
                <option>NuBank</option>
                <option>Inter</option>
                <option>XP Investimentos</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Tipo / Ativo</label>
              <input className="h-12 w-full rounded-xl border border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-[#111813] px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold" placeholder="Ex: CDB 100% CDI" />
            </div>
            <div className="space-y-2 opacity-60">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Investimento Inicial (Fixo)</label>
              <input className="h-12 w-full rounded-xl border border-slate-200 dark:border-surface-highlight bg-slate-100 dark:bg-black/20 px-4 text-slate-600 dark:text-white text-right cursor-not-allowed font-black" placeholder="0,00" value="R$ 10.000,00" readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-primary uppercase tracking-widest">Valor Atualizado (Hoje)</label>
              <input className="h-12 w-full rounded-xl border border-primary/30 dark:border-primary/20 bg-primary/5 dark:bg-[#111813] px-4 text-slate-900 dark:text-white text-right font-black shadow-inner" placeholder="0,00" />
            </div>
            <button className="w-full rounded-xl bg-primary py-4 text-sm font-black text-background-dark shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform" type="button">
              Cadastrar Ativo
            </button>
          </form>
        </div>

        <div className="lg:col-span-8 bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-surface-highlight overflow-hidden shadow-sm">
          <div className="p-6 bg-slate-50 dark:bg-[#152019] border-b border-slate-200 dark:border-surface-highlight">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">Carteira de Ativos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 dark:bg-surface-highlight/30 text-[10px] uppercase font-black text-slate-500 dark:text-text-secondary tracking-[0.2em] border-b border-slate-200 dark:border-surface-highlight">
                <tr>
                  <th className="px-8 py-5">Instituição</th>
                  <th className="px-8 py-5">Tipo</th>
                  <th className="px-8 py-5 text-right">Inicial</th>
                  <th className="px-8 py-5 text-right font-black text-primary">Atual</th>
                  <th className="px-8 py-5 text-center">Rend.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-surface-highlight">
                {[
                  { inst: 'NuBank', type: 'CDB 100% CDI', inv: 'R$ 5.000', now: 'R$ 5.250', yield: '+5.0%' },
                  { inst: 'Inter', type: 'FIIs (MXRF11)', inv: 'R$ 12.000', now: 'R$ 12.180', yield: '+1.5%' },
                  { inst: 'Binance', type: 'Bitcoin', inv: 'R$ 8.000', now: 'R$ 7.600', yield: '-5.0%' },
                  { inst: 'XP', type: 'PETR4', inv: 'R$ 2.500', now: 'R$ 2.850', yield: '+14.0%' }
                ].map((asset, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-surface-highlight/10 transition-colors">
                    <td className="px-8 py-5 font-black text-slate-900 dark:text-white text-sm">{asset.inst}</td>
                    <td className="px-8 py-5 text-slate-600 dark:text-text-secondary text-xs font-bold uppercase tracking-wider">{asset.type}</td>
                    <td className="px-8 py-5 text-right text-slate-500 dark:text-text-secondary text-sm font-bold">{asset.inv}</td>
                    <td className="px-8 py-5 text-right text-slate-900 dark:text-white font-black text-sm">{asset.now}</td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest ${asset.yield.startsWith('+') ? 'bg-primary/10 text-primary' : 'bg-danger/10 text-danger'}`}>
                        {asset.yield}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Investments;
