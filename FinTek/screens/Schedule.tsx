
import React from 'react';
import { useNavigate } from 'react-router-dom';
// Fix: Import User type
import { User } from '../types';

interface CalendarItem {
  title: string;
  color: string;
  type: 'PAGAR' | 'RECEBER';
}

const CalendarDay: React.FC<{ 
  day: number; 
  labelColor?: string; 
  items?: CalendarItem[];
  onItemClick: (type: 'PAGAR' | 'RECEBER') => void;
}> = ({ day, labelColor = 'text-[#9db9a6]', items = [], onItemClick }) => (
  <div className="border-b border-r border-surface-highlight/30 p-2 min-h-[120px] hover:bg-surface-highlight/10 transition-colors group">
    <span className={`${labelColor} text-sm font-bold`}>{day}</span>
    <div className="mt-2 flex flex-col gap-1.5">
      {items.map((item, idx) => (
        <div 
          key={idx} 
          onClick={() => onItemClick(item.type)}
          className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tight truncate border-l-2 ${item.color} bg-white/5 cursor-pointer hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]`}
        >
          {item.title}
        </div>
      ))}
    </div>
  </div>
);

// Fix: Add user prop
const Schedule: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();

  const handleItemClick = (type: 'PAGAR' | 'RECEBER') => {
    if (type === 'PAGAR') {
      navigate('/pagar');
    } else {
      navigate('/receber');
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-[1600px] mx-auto">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div>
          <p className="text-[#9db9a6] text-sm font-medium mb-1">Planejamento de Caixa</p>
          <h1 className="text-white text-4xl font-black tracking-tight">Outubro 2023</h1>
        </div>
        <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto">
          <div className="flex items-center bg-surface-dark rounded-xl p-1 border border-surface-highlight shadow-xl">
            {['Mês', 'Semana', 'Dia'].map((v, i) => (
              <button 
                key={v}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${i === 0 ? 'bg-primary text-background-dark shadow-md' : 'text-[#9db9a6] hover:text-white'}`}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="ml-auto xl:ml-0 px-6 py-2.5 bg-primary text-background-dark font-black rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined">add_circle</span> Novo Agendamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => navigate('/pagar')}
          className="bg-surface-dark rounded-2xl p-6 border border-red-900/30 hover:border-danger/50 transition-all relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute -right-4 -top-4 size-24 bg-danger/10 rounded-full blur-2xl group-hover:bg-danger/20"></div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[#9db9a6] text-[10px] font-bold uppercase tracking-widest mb-1">A Pagar (Agendado)</p>
              <h3 className="text-3xl font-black text-white">R$ 45.230,00</h3>
            </div>
            <div className="p-3 bg-danger/10 rounded-xl text-danger border border-danger/20">
              <span className="material-symbols-outlined">money_off</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-red-400 font-bold">
            <span className="bg-danger/10 px-2 py-0.5 rounded-lg border border-danger/20">12 itens</span>
            <span>vencem este mês</span>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/receber')}
          className="bg-surface-dark rounded-2xl p-6 border border-blue-900/30 hover:border-blue-500/50 transition-all relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute -right-4 -top-4 size-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20"></div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[#9db9a6] text-[10px] font-bold uppercase tracking-widest mb-1">A Receber (Previsto)</p>
              <h3 className="text-3xl font-black text-white">R$ 82.150,00</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
              <span className="material-symbols-outlined">attach_money</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-bold">
            <span className="bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">8 itens</span>
            <span>previstos este mês</span>
          </div>
        </div>

        <div className="bg-surface-dark rounded-2xl p-6 border border-primary/20 hover:border-primary/50 transition-all relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 size-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20"></div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[#9db9a6] text-[10px] font-bold uppercase tracking-widest mb-1">Saldo Projetado</p>
              <h3 className="text-3xl font-black text-white">R$ 36.920,00</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-primary font-bold">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>Crescimento positivo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full min-h-[700px]">
        <div className="xl:col-span-4 flex flex-col h-full bg-surface-dark rounded-2xl border border-surface-highlight overflow-hidden">
          <div className="p-6 border-b border-surface-highlight flex justify-between items-center bg-[#152019]">
            <h3 className="text-white font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">schedule</span> Próximos Vencimentos
            </h3>
            <button className="text-[10px] font-bold text-[#9db9a6] hover:text-white uppercase tracking-widest">Ver todos</button>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto scrollbar-hide flex-1">
            <p className="text-[10px] font-black text-[#9db9a6] uppercase tracking-[0.2em] mb-4">Hoje</p>
            {[
              { title: 'Fornecedor Tecnologia', type: 'PAGAR', amount: 'R$ 4.500', color: 'border-danger text-danger' },
              { title: 'Consultoria Prime', type: 'RECEBER', amount: 'R$ 12.000', color: 'border-blue-500 text-blue-400' }
            ].map((item, i) => (
              <div 
                key={i} 
                onClick={() => handleItemClick(item.type as 'PAGAR' | 'RECEBER')}
                className={`p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden group`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.type === 'PAGAR' ? 'bg-danger' : 'bg-blue-500'}`}></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[9px] font-black uppercase ${item.color}`}>{item.type === 'PAGAR' ? 'A Pagar' : 'A Receber'}</span>
                    <h4 className="text-white font-bold text-sm mt-0.5">{item.title}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black text-sm">{item.amount}</p>
                    <p className="text-[9px] text-[#9db9a6] font-bold uppercase mt-1">Vence hoje</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-8 flex flex-col h-full bg-surface-dark rounded-2xl border border-surface-highlight overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-surface-highlight flex justify-between items-center">
            <h3 className="text-white font-black flex items-center gap-2">
              <span className="material-symbols-outlined">calendar_month</span> Calendário Financeiro
            </h3>
            <div className="flex gap-2">
              <button className="p-1.5 hover:bg-surface-highlight rounded-xl text-[#9db9a6] hover:text-white transition-all"><span className="material-symbols-outlined">chevron_left</span></button>
              <button className="p-1.5 hover:bg-surface-highlight rounded-xl text-[#9db9a6] hover:text-white transition-all"><span className="material-symbols-outlined">chevron_right</span></button>
            </div>
          </div>
          <div className="grid grid-cols-7 border-b border-surface-highlight bg-surface-highlight/10">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="py-4 text-center text-[10px] font-black text-[#9db9a6] uppercase tracking-widest">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 flex-1 auto-rows-fr">
            {Array.from({ length: 35 }, (_, i) => {
              const day = (i - 1) % 31 + 1;
              const isOtherMonth = i < 2 || i > 32;
              return (
                <CalendarDay 
                  key={i} 
                  day={day} 
                  onItemClick={handleItemClick}
                  labelColor={isOtherMonth ? 'text-[#9db9a6]/20' : i + 1 === 24 ? 'text-primary' : undefined} 
                  items={
                    i === 4 ? [{ title: 'AWS Cloud', color: 'border-danger', type: 'PAGAR' }] :
                    i === 11 ? [{ title: 'Alpha Corp', color: 'border-blue-500', type: 'RECEBER' }] :
                    i === 24 ? [{ title: 'Forn. TI', color: 'border-danger', type: 'PAGAR' }, { title: 'Prime Consult', color: 'border-blue-500', type: 'RECEBER' }] :
                    []
                  }
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
