
import React from 'react';

const Investimentos: React.FC = () => {
  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-surface-highlight">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-white tracking-tight">Carteira de Investimentos</h1>
          <p className="text-[#9db9a6] text-base font-normal">Acompanhe a rentabilidade e evolução do seu patrimônio.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 rounded-xl bg-surface-dark border border-surface-highlight text-white font-bold text-sm shadow-sm flex items-center gap-2 hover:border-primary transition-all">
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
          <div key={i} className="bg-surface-dark rounded-2xl p-8 border border-surface-highlight shadow-2xl relative group overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
              <span className="material-symbols-outlined text-6xl text-primary">{stat.icon}</span>
            </div>
            <p className="text-[#9db9a6] text-[10px] font-bold uppercase tracking-widest mb-2">{stat.label}</p>
            <p className="text-3xl font-black text-white tracking-tight">{stat.value}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">trending_up</span>
              <span className="text-primary font-black text-sm">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-4 bg-surface-dark rounded-2xl border border-surface-highlight p-8 shadow-2xl sticky top-24">
          <div className="flex items-center gap-3 border-b border-surface-highlight pb-6 mb-8">
            <div className="p-3 bg-primary/10 rounded-xl text-primary"><span className="material-symbols-outlined">add_chart</span></div>
            <h3 className="text-lg font-bold text-white">Novo Ativo</h3>
          </div>
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9db9a6] uppercase tracking-widest">Instituição</label>
              <select className="h-12 w-full rounded-xl border border-surface-highlight bg-[#111813] px-4 text-white focus:ring-1 focus:ring-primary">
                <option>NuBank</option>
                <option>Inter</option>
                <option>XP Investimentos</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9db9a6] uppercase tracking-widest">Tipo / Ativo</label>
              <input className="h-12 w-full rounded-xl border border-surface-highlight bg-[#111813] px-4 text-white" placeholder="Ex: CDB 100% CDI" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9db9a6] uppercase tracking-widest">Valor do Aporte</label>
              <input className="h-12 w-full rounded-xl border border-surface-highlight bg-[#111813] px-4 text-white text-right" placeholder="0,00" />
            </div>
            <button className="w-full rounded-xl bg-primary py-4 text-sm font-black text-background-dark shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
              Cadastrar Ativo
            </button>
          </form>
        </div>

        <div className="lg:col-span-8 bg-surface-dark rounded-2xl border border-surface-highlight overflow-hidden shadow-2xl">
          <div className="p-6 bg-[#152019] border-b border-surface-highlight">
            <h3 className="text-lg font-bold text-white">Carteira de Ativos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-highlight/30 text-[10px] uppercase font-black text-[#9db9a6] tracking-widest">
                <tr>
                  <th className="px-8 py-5">Instituição</th>
                  <th className="px-8 py-5">Tipo</th>
                  <th className="px-8 py-5 text-right">Investido</th>
                  <th className="px-8 py-5 text-right">Atual</th>
                  <th className="px-8 py-5 text-center">Rend.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-highlight">
                {[
                  { inst: 'NuBank', type: 'CDB 100% CDI', inv: 'R$ 5.000', now: 'R$ 5.250', yield: '+5.0%' },
                  { inst: 'Inter', type: 'FIIs (MXRF11)', inv: 'R$ 12.000', now: 'R$ 12.180', yield: '+1.5%' },
                  { inst: 'Binance', type: 'Bitcoin', inv: 'R$ 8.000', now: 'R$ 7.600', yield: '-5.0%' },
                  { inst: 'XP', type: 'PETR4', inv: 'R$ 2.500', now: 'R$ 2.850', yield: '+14.0%' }
                ].map((asset, i) => (
                  <tr key={i} className="hover:bg-surface-highlight/10 transition-colors">
                    <td className="px-8 py-5 font-bold text-white text-sm">{asset.inst}</td>
                    <td className="px-8 py-5 text-[#9db9a6] text-xs font-bold uppercase">{asset.type}</td>
                    <td className="px-8 py-5 text-right text-[#9db9a6] text-sm">{asset.inv}</td>
                    <td className="px-8 py-5 text-right text-white font-black text-sm">{asset.now}</td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black ${asset.yield.startsWith('+') ? 'bg-primary/10 text-primary' : 'bg-danger/10 text-danger'}`}>
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

export default Investimentos;
