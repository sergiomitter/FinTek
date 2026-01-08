
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { Search, Download, PlusCircle, Edit3, Trash2, Calendar, Hourglass, AlertCircle, CheckCircle } from 'lucide-react';
import EditReceivableModal from '../components/EditReceivableModal';
import ExportReceivableModal from '../components/ExportReceivableModal';

interface Company { id: string; name: string; }
interface Customer { id: string; name: string; }
interface Bank { id: string; name: string; type: string; }
interface ReceivableRecord {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  status: string;
  customer_id: string;
  company_id: string;
  bank_id: string;
  customer?: { name: string };
  company?: { name: string };
  bank?: { name: string };
}

const Receivable: React.FC<{ user: User }> = ({ user }) => {
  const isReadOnly = user.role === 'USER';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Modals state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'delete'>('edit');
  const [selectedRecord, setSelectedRecord] = useState<ReceivableRecord | null>(null);

  // Form State
  const [description, setDescription] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [bankId, setBankId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Data Lists
  const [companies, setCompanies] = useState<Company[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [records, setRecords] = useState<ReceivableRecord[]>([]);

  useEffect(() => {
    fetchInitialData();
    fetchRecords();
  }, []);

  const fetchInitialData = async () => {
    const [compRes, custRes, bankRes] = await Promise.all([
      supabase.from('companies').select('id, name').order('name'),
      supabase.from('customers').select('id, name').order('name'),
      supabase.from('banks').select('id, name, type').order('name')
    ]);

    if (compRes.data) setCompanies(compRes.data);
    if (custRes.data) setCustomers(custRes.data);
    if (bankRes.data) setBanks(bankRes.data);
  };

  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('receivables')
      .select(`
                id, description, amount, due_date, status, customer_id, company_id, bank_id,
                customer:customers(name),
                company:companies(name),
                bank:banks(name)
            `)
      .order('due_date', { ascending: false });

    if (error) {
      console.error('Error fetching records:', error);
    } else {
      setRecords(data as any);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !customerId || !companyId || !bankId) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('receivables').insert([{
      description,
      customer_id: customerId,
      company_id: companyId,
      bank_id: bankId,
      amount: parseFloat(amount.toString().replace(',', '.')),
      due_date: dueDate,
      status: 'PENDING',
      user_id: user.id
    }]);

    if (error) {
      alert('Erro ao salvar lançamento: ' + error.message);
    } else {
      setDescription('');
      setAmount('');
      setCustomerId('');
      setCompanyId('');
      setBankId('');
      fetchRecords();
    }
    setSaving(false);
  };

  const calculateOverdueDays = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    if (due < today) {
      const diffTime = Math.abs(today.getTime() - due.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const filteredRecords = records.filter(rec => {
    const matchesSearch = rec.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!filterStatus) return matchesSearch;

    if (filterStatus === 'OVERDUE') {
      return matchesSearch && (rec.status === 'OVERDUE' || (new Date(rec.due_date) < new Date() && rec.status === 'PENDING'));
    }

    return matchesSearch && rec.status === filterStatus;
  });

  // KPI Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const receivedToday = records
    .filter(r => r.status === 'RECEIVED' && r.due_date === todayStr)
    .reduce((acc, r) => acc + Number(r.amount), 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const pendingMonth = records
    .filter(r => r.status === 'PENDING' && new Date(r.due_date) >= startOfMonth)
    .reduce((acc, r) => acc + Number(r.amount), 0);

  const overdueTotal = records
    .filter(r => r.status === 'OVERDUE' || (new Date(r.due_date) < new Date() && r.status === 'PENDING'))
    .reduce((acc, r) => acc + Number(r.amount), 0);

  const toggleFilter = (status: string) => {
    if (filterStatus === status) setFilterStatus(null);
    else setFilterStatus(status);
  };

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 dark:text-white text-4xl font-black tracking-tight">Contas a Receber</h1>
          <p className="text-slate-600 dark:text-text-secondary text-base font-medium">Gerencie suas entradas e previsões de recebimento.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar recebimento..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 h-12 rounded-xl border border-slate-200 dark:border-surface-highlight bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm font-bold w-64 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>
          {!isReadOnly && (
            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-2 px-6 h-12 rounded-xl bg-primary hover:bg-primary-hover transition text-background-dark text-sm font-black shadow-lg shadow-primary/20"
            >
              <Download className="w-4 h-4" /> Exportar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => toggleFilter('RECEIVED')}
          className={`bg-white dark:bg-surface-dark rounded-2xl border p-6 relative overflow-hidden group cursor-pointer transition-all ${filterStatus === 'RECEIVED' ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 dark:border-surface-highlight hover:border-primary/50'}`}
        >
          <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="text-text-secondary text-xs font-bold uppercase tracking-widest text-primary">Recebido Hoje</span>
            <div className="size-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">
            {receivedToday.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="mt-2 text-xs font-bold text-text-secondary">Clique para filtrar</p>
        </div>

        <div
          onClick={() => toggleFilter('PENDING')}
          className={`bg-white dark:bg-surface-dark rounded-2xl border p-6 relative overflow-hidden group cursor-pointer transition-all ${filterStatus === 'PENDING' ? 'border-yellow-500 ring-2 ring-yellow-500/20' : 'border-slate-200 dark:border-surface-highlight hover:border-yellow-500/50'}`}
        >
          <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="text-text-secondary text-xs font-bold uppercase tracking-widest text-yellow-600 dark:text-yellow-500">Pendente (Mês)</span>
            <div className="size-10 rounded-xl flex items-center justify-center bg-yellow-500/10 text-yellow-600 dark:text-yellow-500">
              <Hourglass className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">
            {pendingMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="mt-2 text-xs font-bold text-text-secondary">Clique para filtrar</p>
        </div>

        <div
          onClick={() => toggleFilter('OVERDUE')}
          className={`bg-white dark:bg-surface-dark rounded-2xl border p-6 relative overflow-hidden group cursor-pointer transition-all ${filterStatus === 'OVERDUE' ? 'border-danger ring-2 ring-danger/20' : 'border-slate-200 dark:border-surface-highlight hover:border-danger/50'}`}
        >
          <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="text-text-secondary text-xs font-bold uppercase tracking-widest text-danger">Vencidos</span>
            <div className="size-10 rounded-xl flex items-center justify-center bg-danger/10 text-danger">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">
            {overdueTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="mt-2 text-xs font-bold text-danger">Ação necessária</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className={`xl:w-1/3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-highlight rounded-2xl p-8 shadow-sm h-fit ${isReadOnly ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-3 mb-8 border-b border-slate-200 dark:border-surface-highlight pb-6">
            <PlusCircle className="text-primary w-8 h-8" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Novo Lançamento</h3>
          </div>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Descrição</label>
              <input
                required
                className="w-full bg-slate-50 dark:bg-surface-darker border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold placeholder-slate-400"
                placeholder="Ex: Consultoria Mensal"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Cliente</label>
              <select
                required
                className="w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold appearance-none"
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
              >
                <option value="" disabled>Selecione o cliente...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Empresa Destino</label>
              <select
                required
                className="w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold appearance-none"
                value={companyId}
                onChange={e => setCompanyId(e.target.value)}
              >
                <option value="" disabled>Selecione a empresa...</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Banco para Crédito</label>
              <select
                required
                className="w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold appearance-none"
                value={bankId}
                onChange={e => setBankId(e.target.value)}
              >
                <option value="" disabled>Selecione a conta bancária...</option>
                {banks.map(b => <option key={b.id} value={b.id}>{b.name} - {b.type}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Valor (R$)</label>
                <input
                  required
                  className="w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary text-right font-black"
                  placeholder="0,00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Vencimento</label>
                <input
                  type="date"
                  required
                  className="w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full h-14 bg-primary hover:bg-primary-hover text-background-dark font-black rounded-xl transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <PlusCircle className={`w-5 h-5 ${saving ? 'animate-spin' : ''}`} />
              {saving ? 'SALVANDO...' : 'SALVAR RECEBIMENTO'}
            </button>
          </form>
        </div>

        <div className="xl:w-2/3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-highlight rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-surface-highlight flex justify-between items-center bg-slate-50 dark:bg-surface-darker">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">Últimos Lançamentos</h3>
            {filterStatus && (
              <button
                onClick={() => setFilterStatus(null)}
                className="text-[10px] font-black bg-danger/10 text-danger border border-danger/20 px-3 py-1 rounded-lg uppercase transition-all hover:bg-danger hover:text-white"
              >
                Limpar Filtro
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-surface-highlight/30 text-[10px] uppercase font-black tracking-[0.15em] text-slate-500 dark:text-text-secondary border-b border-slate-200 dark:border-surface-highlight">
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Descrição</th>
                  <th className="px-6 py-5">Cliente</th>
                  <th className="px-6 py-5 text-right">Valor</th>
                  <th className="px-6 py-5">Vencimento</th>
                  <th className="px-6 py-5 text-center">Atraso</th>
                  {!isReadOnly && <th className="px-6 py-5 text-center">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-surface-highlight text-sm font-bold">
                {loading ? (
                  <tr><td colSpan={7} className="p-20 text-center text-text-secondary font-bold uppercase tracking-widest">Carregando lançamentos...</td></tr>
                ) : filteredRecords.length === 0 ? (
                  <tr><td colSpan={7} className="p-20 text-center text-text-secondary font-bold uppercase tracking-widest">Nenhum lançamento encontrado.</td></tr>
                ) : filteredRecords.map((row) => {
                  const overdueDays = (row.status === 'PENDING' || row.status === 'OVERDUE') ? calculateOverdueDays(row.due_date) : 0;
                  return (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-surface-highlight/20 transition-all group">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${row.status === 'RECEIVED' ? 'bg-primary/10 text-primary border-primary/20' :
                            (overdueDays > 0 || row.status === 'OVERDUE') ? 'bg-danger/10 text-danger border-danger/20' :
                              'bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-500/20'
                          }`}>
                          {row.status === 'RECEIVED' ? 'RECEBIDO' : overdueDays > 0 ? 'ATRASADO' : 'PENDENTE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900 dark:text-white capitalize">{row.description}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-text-secondary">{row.customer?.name}</td>
                      <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">
                        {Number(row.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4 text-slate-900 dark:text-white whitespace-nowrap">
                        {new Date(row.due_date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {overdueDays > 0 ? (
                          <span className="text-danger font-black text-xs">{overdueDays}d</span>
                        ) : (
                          <span className="text-slate-300 dark:text-surface-highlight">-</span>
                        )}
                      </td>
                      {!isReadOnly && (
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <button
                              className="p-2 hover:bg-slate-200 dark:hover:bg-surface-highlight rounded-lg text-slate-900 dark:text-white transition-colors"
                              onClick={() => {
                                setSelectedRecord(row);
                                setModalMode('edit');
                                setIsEditOpen(true);
                              }}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 hover:bg-danger/10 rounded-lg text-danger transition-colors"
                              onClick={() => {
                                setSelectedRecord(row);
                                setModalMode('delete');
                                setIsEditOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ExportReceivableModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={records}
        companies={companies}
        customers={customers}
        banks={banks}
      />

      <EditReceivableModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        companies={companies}
        customers={customers}
        banks={banks}
        onSuccess={fetchRecords}
        mode={modalMode}
      />
    </div>
  );
};

export default Receivable;
