
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, PlusCircle, TrendingDown, TrendingUp, Landmark, Clock, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarItem {
  title: string;
  color: string;
  type: 'PAGAR' | 'RECEBER';
  amount: number;
}

const CalendarDay: React.FC<{
  day: number;
  isOtherMonth?: boolean;
  isCurrentDay?: boolean;
  items?: CalendarItem[];
  onItemClick: (type: 'PAGAR' | 'RECEBER') => void;
}> = ({ day, isOtherMonth, isCurrentDay, items = [], onItemClick }) => (
  <div className={`border-b border-r border-surface-highlight/30 p-2 min-h-[120px] hover:bg-surface-highlight/10 transition-colors group ${isOtherMonth ? 'bg-black/20' : ''}`}>
    <span className={`text-sm font-bold ${isOtherMonth ? 'text-[#9db9a6]/20' : isCurrentDay ? 'text-primary' : 'text-[#9db9a6]'}`}>
      {day}
    </span>
    <div className="mt-2 flex flex-col gap-1.5">
      {items.map((item, idx) => (
        <div
          key={idx}
          onClick={() => onItemClick(item.type)}
          className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tight truncate border-l-2 ${item.color} bg-white/5 cursor-pointer hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]`}
          title={`${item.type}: ${item.title} - R$ ${item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        >
          {item.title}
        </div>
      ))}
    </div>
  </div>
);

const Schedule: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [payables, setPayables] = useState<any[]>([]);
  const [receivables, setReceivables] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    setLoading(true);
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    const [payRes, recRes] = await Promise.all([
      supabase.from('payables')
        .select('*, supplier:suppliers(name)')
        .gte('due_date', start.toISOString())
        .lte('due_date', end.toISOString()),
      supabase.from('receivables')
        .select('*, customer:customers(name)')
        .gte('due_date', start.toISOString())
        .lte('due_date', end.toISOString())
    ]);

    if (payRes.data) setPayables(payRes.data);
    if (recRes.data) setReceivables(recRes.data);
    setLoading(false);
  };

  const handleItemClick = (type: 'PAGAR' | 'RECEBER') => {
    navigate(type === 'PAGAR' ? '/pagar' : '/receber');
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const startDay = getDay(startOfMonth(currentDate));
  const calendarDays = [];

  // Previous month paddings
  const prevMonthEnd = endOfMonth(subMonths(currentDate, 1));
  for (let i = startDay - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), prevMonthEnd.getDate() - i),
      isOtherMonth: true
    });
  }

  // Current month days
  daysInMonth.forEach(date => {
    calendarDays.push({ date, isOtherMonth: false });
  });

  // Next month paddings
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
      isOtherMonth: true
    });
  }

  const kpiPayable = payables.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const kpiReceivable = receivables.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const kpiProjected = kpiReceivable - kpiPayable;

  const todayItems = [
    ...payables.filter(p => isToday(parseISO(p.due_date))).map(p => ({ ...p, type: 'PAGAR', color: 'border-danger text-danger' })),
    ...receivables.filter(r => isToday(parseISO(r.due_date))).map(r => ({ ...r, type: 'RECEBER', color: 'border-blue-500 text-blue-400' }))
  ];

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-[1600px] mx-auto">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div>
          <p className="text-[#9db9a6] text-sm font-medium mb-1">Planejamento de Caixa</p>
          <h1 className="text-white text-4xl font-black tracking-tight capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h1>
        </div>
        <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto">
          <div className="flex items-center bg-surface-dark rounded-xl p-1 border border-surface-highlight shadow-xl">
            <button onClick={prevMonth} className="p-2 hover:bg-surface-highlight rounded-lg text-[#9db9a6] hover:text-white transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-xs font-bold text-white hover:text-primary transition-all">
              Hoje
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-surface-highlight rounded-lg text-[#9db9a6] hover:text-white transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => navigate('/pagar')}
            className="ml-auto xl:ml-0 px-6 py-2.5 bg-primary text-background-dark font-black rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <PlusCircle className="w-5 h-5" /> Novo Agendamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div onClick={() => navigate('/pagar')} className="bg-surface-dark rounded-2xl p-6 border border-red-900/30 hover:border-danger/50 transition-all relative overflow-hidden group cursor-pointer">
          <div className="absolute -right-4 -top-4 size-24 bg-danger/10 rounded-full blur-2xl group-hover:bg-danger/20"></div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[#9db9a6] text-[10px] font-bold uppercase tracking-widest mb-1">A Pagar (Agendado)</p>
              <h3 className="text-3xl font-black text-white">R$ {kpiPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-3 bg-danger/10 rounded-xl text-danger border border-danger/20">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-red-400 font-bold">
            <span className="bg-danger/10 px-2 py-0.5 rounded-lg border border-danger/20">{payables.length} itens</span>
            <span>este mês</span>
          </div>
        </div>

        <div onClick={() => navigate('/receber')} className="bg-surface-dark rounded-2xl p-6 border border-blue-900/30 hover:border-blue-500/50 transition-all relative overflow-hidden group cursor-pointer">
          <div className="absolute -right-4 -top-4 size-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20"></div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[#9db9a6] text-[10px] font-bold uppercase tracking-widest mb-1">A Receber (Previsto)</p>
              <h3 className="text-3xl font-black text-white">R$ {kpiReceivable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-bold">
            <span className="bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">{receivables.length} itens</span>
            <span>este mês</span>
          </div>
        </div>

        <div className="bg-surface-dark rounded-2xl p-6 border border-primary/20 hover:border-primary/50 transition-all relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 size-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20"></div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[#9db9a6] text-[10px] font-bold uppercase tracking-widest mb-1">Saldo Projetado</p>
              <h3 className="text-3xl font-black text-white">R$ {kpiProjected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <Landmark className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-primary font-bold">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>Previsão Mensal</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full min-h-[700px]">
        <div className="xl:col-span-4 flex flex-col h-full bg-surface-dark rounded-2xl border border-surface-highlight overflow-hidden">
          <div className="p-6 border-b border-surface-highlight flex justify-between items-center bg-[#152019]">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Clock className="text-primary w-5 h-5" /> Próximos Vencimentos
            </h3>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto scrollbar-hide flex-1">
            <p className="text-[10px] font-black text-[#9db9a6] uppercase tracking-[0.2em] mb-4">Hoje</p>
            {todayItems.length === 0 ? (
              <p className="text-xs text-[#9db9a6] italic">Nenhum vencimento para hoje.</p>
            ) : (
              todayItems.map((item, i) => (
                <div
                  key={i}
                  onClick={() => handleItemClick(item.type as 'PAGAR' | 'RECEBER')}
                  className={`p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden group`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.type === 'PAGAR' ? 'bg-danger' : 'bg-blue-500'}`}></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-[9px] font-black uppercase ${item.color}`}>{item.type === 'PAGAR' ? 'A Pagar' : 'A Receber'}</span>
                      <h4 className="text-white font-bold text-sm mt-0.5">{item.supplier?.name || item.customer?.name || item.description}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-black text-sm">R$ {parseFloat(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="xl:col-span-8 flex flex-col h-full bg-surface-dark rounded-2xl border border-surface-highlight overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-surface-highlight flex justify-between items-center">
            <h3 className="text-white font-black flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" /> Calendário Financeiro
            </h3>
          </div>
          <div className="grid grid-cols-7 border-b border-surface-highlight bg-surface-highlight/10">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="py-4 text-center text-[10px] font-black text-[#9db9a6] uppercase tracking-widest">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 flex-1 auto-rows-fr">
            {loading ? (
              <div className="col-span-7 flex items-center justify-center p-20 text-primary">
                <span className="material-symbols-outlined animate-spin text-4xl">autorenew</span>
              </div>
            ) : (
              calendarDays.map((dayObj, i) => {
                const dayStr = format(dayObj.date, 'yyyy-MM-dd');
                const dayPayables = payables.filter(p => p.due_date.startsWith(dayStr)).map(p => ({
                  title: p.supplier?.name || p.description,
                  color: 'border-danger',
                  type: 'PAGAR' as const,
                  amount: parseFloat(p.amount)
                }));
                const dayReceivables = receivables.filter(r => r.due_date.startsWith(dayStr)).map(r => ({
                  title: r.customer?.name || r.description,
                  color: 'border-blue-500',
                  type: 'RECEBER' as const,
                  amount: parseFloat(r.amount)
                }));

                return (
                  <CalendarDay
                    key={i}
                    day={dayObj.date.getDate()}
                    isOtherMonth={dayObj.isOtherMonth}
                    isCurrentDay={isToday(dayObj.date)}
                    onItemClick={handleItemClick}
                    items={[...dayPayables, ...dayReceivables]}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
