
import React, { useState } from 'react';
import { User } from '../types';

interface KPIRecord {
  id: string;
  description: string;
  entity: string;
  value: string;
  date: string;
  status?: string;
}

interface KPIModalData {
  title: string;
  icon: string;
  records: KPIRecord[];
  type: 'pagar' | 'pago' | 'investido' | 'recebido';
}

const DashboardCard: React.FC<{
  title: string;
  amount: string;
  icon: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  color?: string;
  onClick?: () => void;
}> = ({ title, amount, icon, trend, trendType, color = 'primary', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white dark:bg-surface-dark rounded-2xl p-6 border border-slate-200 dark:border-surface-highlight hover:border-primary/50 transition-all duration-300 relative group overflow-hidden shadow-sm hover:shadow-xl ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
      <span className={`material-symbols-outlined text-6xl text-${color}`}>{icon}</span>
    </div>
    <div className="flex flex-col gap-3 relative z-10">
      <div className="flex items-center gap-2 text-slate-500 dark:text-[#9db9a6]">
        <span className="text-xs font-black uppercase tracking-wider">{title}</span>
      </div>
      <div>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{amount}</h3>
        {trend && (
          <p className={`text-sm mt-1 flex items-center gap-1 font-bold ${
            trendType === 'positive' ? 'text-primary' : trendType === 'negative' ? 'text-danger' : 'text-slate-500 dark:text-[#9db9a6]'
          }`}>
            <span className="material-symbols-outlined text-sm">
              {trendType === 'positive' ? 'trending_up' : trendType === 'negative' ? 'trending_down' : 'info'}
            </span>
            {trend}
          </p>
        )}
      </div>
    </div>
    <div className="h-1.5 w-full bg-slate-100 dark:bg-surface-highlight mt-6 rounded-full overflow-hidden">
      <div className={`h-full bg-${color === 'danger' ? 'danger' : 'primary'} w-[45%]`}></div>
    </div>
    {onClick && (
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="material-symbols-outlined text-primary text-xl">open_in_new</span>
      </div>
    )}
  </div>
);

const KPIModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  data: KPIModalData | null;
}> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'VENCENDO': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20';
      case 'PAGO': return 'bg-primary/10 text-primary border-primary/20';
      case 'RECEBIDO': return 'bg-primary/10 text-primary border-primary/20';
      case 'ATRASADO': return 'bg-danger/10 text-danger border-danger/20';
      case 'PENDENTE': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20';
      case 'APLICADO': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getHeaderColor = () => {
    switch (data.type) {
      case 'pagar': return 'from-danger/20 to-transparent';
      case 'pago': return 'from-primary/20 to-transparent';
      case 'investido': return 'from-blue-500/20 to-transparent';
      case 'recebido': return 'from-primary/20 to-transparent';
      default: return 'from-primary/20 to-transparent';
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" 
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-highlight rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden pointer-events-auto animate-in zoom-in-95 fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`p-6 border-b border-slate-200 dark:border-surface-highlight bg-gradient-to-r ${getHeaderColor()}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 dark:bg-white/5 rounded-xl">
                  <span className="material-symbols-outlined text-2xl text-slate-900 dark:text-white">{data.icon}</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">{data.title}</h2>
                  <p className="text-sm text-slate-500 dark:text-text-secondary font-medium">{data.records.length} registro(s) encontrado(s)</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-200 dark:hover:bg-surface-highlight rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500 dark:text-text-secondary">close</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-surface-highlight/30 sticky top-0">
                <tr className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-text-secondary border-b border-slate-200 dark:border-surface-highlight">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4">Entidade</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-surface-highlight">
                {data.records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-surface-highlight/10 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(record.status)}`}>
                        {record.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-sm">{record.description}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-text-secondary text-sm font-medium">{record.entity}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-text-secondary text-sm font-medium">{record.date}</td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white text-sm">{record.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-surface-highlight/20 flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 bg-primary text-background-dark font-black rounded-xl text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Mock data for KPIs
const kpiData: Record<string, KPIModalData> = {
  aPagarHoje: {
    title: 'Contas a Pagar Hoje',
    icon: 'payments',
    type: 'pagar',
    records: [
      { id: '1', description: 'Aluguel do Escritório', entity: 'Imobiliária Central', value: 'R$ 4.500,00', date: '24/10/2023', status: 'VENCENDO' },
      { id: '2', description: 'Serviço de Internet', entity: 'Telecom Brasil', value: 'R$ 450,00', date: '24/10/2023', status: 'VENCENDO' },
      { id: '3', description: 'Energia Elétrica', entity: 'COPEL', value: 'R$ 7.500,00', date: '24/10/2023', status: 'VENCENDO' },
    ]
  },
  pagoNoMes: {
    title: 'Contas Pagas no Mês',
    icon: 'check_circle',
    type: 'pago',
    records: [
      { id: '1', description: 'Folha de Pagamento', entity: 'Funcionários', value: 'R$ 85.000,00', date: '05/10/2023', status: 'PAGO' },
      { id: '2', description: 'Impostos Federais', entity: 'Receita Federal', value: 'R$ 22.500,00', date: '10/10/2023', status: 'PAGO' },
      { id: '3', description: 'Fornecedor Equipamentos', entity: 'Tech Supply', value: 'R$ 18.200,00', date: '12/10/2023', status: 'PAGO' },
      { id: '4', description: 'Seguro Empresarial', entity: 'Porto Seguro', value: 'R$ 8.500,00', date: '15/10/2023', status: 'PAGO' },
      { id: '5', description: 'Marketing Digital', entity: 'Agência XYZ', value: 'R$ 11.000,00', date: '18/10/2023', status: 'PAGO' },
    ]
  },
  investidoHoje: {
    title: 'Investimentos Realizados Hoje',
    icon: 'savings',
    type: 'investido',
    records: [
      { id: '1', description: 'Aporte CDB 100% CDI', entity: 'NuBank', value: 'R$ 3.000,00', date: '24/10/2023', status: 'APLICADO' },
      { id: '2', description: 'Compra de FIIs', entity: 'XP Investimentos', value: 'R$ 2.000,00', date: '24/10/2023', status: 'APLICADO' },
    ]
  },
  recebidoMes: {
    title: 'Recebimentos do Mês',
    icon: 'account_balance',
    type: 'recebido',
    records: [
      { id: '1', description: 'Consultoria TI - Agosto', entity: 'Tech Solutions', value: 'R$ 45.000,00', date: '02/10/2023', status: 'RECEBIDO' },
      { id: '2', description: 'Projeto Sistema ERP', entity: 'Indústria Omega', value: 'R$ 75.000,00', date: '08/10/2023', status: 'RECEBIDO' },
      { id: '3', description: 'Suporte Mensal', entity: 'Alpha Corp', value: 'R$ 12.000,00', date: '15/10/2023', status: 'RECEBIDO' },
      { id: '4', description: 'Treinamento Equipe', entity: 'Banco Nacional', value: 'R$ 28.000,00', date: '20/10/2023', status: 'RECEBIDO' },
      { id: '5', description: 'Licença Software', entity: 'StartupX', value: 'R$ 20.000,00', date: '22/10/2023', status: 'RECEBIDO' },
    ]
  }
};

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<KPIModalData | null>(null);

  const handleKPIClick = (kpiKey: string) => {
    setSelectedKPI(kpiData[kpiKey]);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedKPI(null);
  };

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <p className="text-slate-500 dark:text-[#9db9a6] text-sm font-bold uppercase tracking-wide mb-1">Olá, {user.nome.split(' ')[0]}!</p>
          <h1 className="text-slate-900 dark:text-white text-4xl font-black tracking-tight">Hoje, 24 de Outubro</h1>
        </div>
        <div className="flex gap-3">
          {user.role === 'ADMIN' && (
            <button className="px-6 py-2.5 bg-primary text-background-dark font-black rounded-xl text-sm hover:bg-primary-hover transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined">add</span> Novo Lançamento
            </button>
          )}
          <button className="px-6 py-2.5 bg-slate-200 dark:bg-surface-highlight text-slate-900 dark:text-white font-black rounded-xl text-sm hover:opacity-80 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined">download</span> Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="A Pagar Hoje" 
          amount="R$ 12.450,00" 
          icon="payments" 
          trend="3 títulos vencendo" 
          trendType="negative" 
          color="danger" 
          onClick={() => handleKPIClick('aPagarHoje')}
        />
        <DashboardCard 
          title="Pago no Mês" 
          amount="R$ 145.200,00" 
          icon="check_circle" 
          trend="42 contas pagas" 
          trendType="positive" 
          onClick={() => handleKPIClick('pagoNoMes')}
        />
        <DashboardCard 
          title="Investido Hoje" 
          amount="R$ 5.000,00" 
          icon="savings" 
          trend="Aporte programado" 
          onClick={() => handleKPIClick('investidoHoje')}
        />
        <DashboardCard 
          title="Recebido Mês" 
          amount="R$ 180.000,00" 
          icon="account_balance" 
          trend="+8% vs mês anterior" 
          trendType="positive" 
          onClick={() => handleKPIClick('recebidoMes')}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
          <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-surface-highlight p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
              <div>
                <h3 className="text-slate-900 dark:text-white text-xl font-black">Fluxo Mensal</h3>
                <p className="text-slate-500 dark:text-[#9db9a6] text-sm font-medium">Comparativo de Entradas e Saídas</p>
              </div>
              <div className="bg-slate-50 dark:bg-surface-highlight/50 border border-slate-200 dark:border-surface-highlight rounded-2xl p-4 flex items-center gap-6 shadow-inner">
                <div>
                  <p className="text-slate-500 dark:text-[#9db9a6] text-[10px] font-black uppercase tracking-wider">Saldo Líquido</p>
                  <p className="text-primary text-2xl font-black">+ R$ 34.800,00</p>
                </div>
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <span className="material-symbols-outlined text-3xl">trending_up</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <span className="w-20 text-right text-xs font-black text-slate-400 dark:text-[#9db9a6] uppercase tracking-wider">Receitas</span>
                <div className="flex-1 h-12 bg-slate-50 dark:bg-surface-highlight/30 rounded-2xl relative overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-primary/60 to-primary w-[85%] rounded-2xl flex items-center justify-end px-4 shadow-lg">
                    <span className="text-background-dark font-black text-sm">R$ 180.000,00</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="w-20 text-right text-xs font-black text-slate-400 dark:text-[#9db9a6] uppercase tracking-wider">Despesas</span>
                <div className="flex-1 h-12 bg-slate-50 dark:bg-surface-highlight/30 rounded-2xl relative overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-danger/60 to-danger w-[68%] rounded-2xl flex items-center justify-end px-4 shadow-lg">
                    <span className="text-white font-black text-sm">R$ 145.200,00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-6">
              <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-primary shadow-sm"></div><span className="text-slate-500 dark:text-[#9db9a6] text-[10px] font-black uppercase">Entradas</span></div>
              <div className="flex items-center gap-2"><div className="size-3 rounded-full bg-danger shadow-sm"></div><span className="text-slate-500 dark:text-[#9db9a6] text-[10px] font-black uppercase">Saídas</span></div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-8">
           <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-surface-highlight overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-[#152019] flex justify-between items-center">
              <h3 className="text-slate-900 dark:text-white font-black flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">account_balance</span> Saldos Bancários
              </h3>
              <span className="text-[10px] font-black bg-slate-200 dark:bg-surface-highlight text-slate-700 dark:text-[#9db9a6] px-2 py-1 rounded-md uppercase tracking-wider">Ativos</span>
            </div>
            <div className="p-2">
              {[
                { name: 'Nubank', type: 'Conta Corrente', color: 'bg-purple-900', label: 'NU', balance: 'R$ 15.420,00' },
                { name: 'Itaú', type: 'Poupança', color: 'bg-orange-600', label: 'IT', balance: 'R$ 8.230,50' },
                { name: 'Banco do Brasil', type: 'Investimento', color: 'bg-yellow-600', label: 'BB', balance: 'R$ 42.100,00' },
                { name: 'Inter PJ', type: 'Giro', color: 'bg-slate-700', label: 'IN', balance: 'R$ 25.600,00' }
              ].map((bank, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-surface-highlight rounded-xl transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`size-10 rounded-full ${bank.color} flex items-center justify-center text-white font-black text-xs border-2 border-white dark:border-white/10 shadow-sm group-hover:scale-110 transition-transform`}>
                      {bank.label}
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white text-sm font-black">{bank.name}</p>
                      <p className="text-slate-400 dark:text-[#9db9a6] text-[10px] font-black uppercase tracking-wider">{bank.type}</p>
                    </div>
                  </div>
                  <p className="text-slate-900 dark:text-white font-black text-sm">{bank.balance}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <KPIModal 
        isOpen={modalOpen} 
        onClose={closeModal} 
        data={selectedKPI} 
      />
    </div>
  );
};

export default Dashboard;
