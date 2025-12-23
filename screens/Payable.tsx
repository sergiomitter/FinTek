
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { Search, Download, PlusCircle, Edit3, Trash2 } from 'lucide-react';
import ExportPayableModal from '../components/ExportPayableModal';
import EditPayableModal from '../components/EditPayableModal';

interface Company { id: string; name: string; }
interface Supplier { id: string; name: string; }
interface Bank { id: string; name: string; type: string; }
interface PayableRecord {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  status: string;
  supplier_id: string;
  company_id: string;
  bank_id: string;
  supplier?: { name: string };
  company?: { name: string };
  bank?: { name: string };
}

const Payable: React.FC<{ user: User }> = ({ user }) => {
  const isReadOnly = user.role === 'USER';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'delete'>('edit');
  const [selectedRecord, setSelectedRecord] = useState<PayableRecord | null>(null);

  // Form State
  const [description, setDescription] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [bankId, setBankId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Data Lists
  const [companies, setCompanies] = useState<Company[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [records, setRecords] = useState<PayableRecord[]>([]);

  useEffect(() => {
    fetchInitialData();
    fetchRecords();
  }, []);

  const fetchInitialData = async () => {
    const [compRes, suppRes, bankRes] = await Promise.all([
      supabase.from('companies').select('id, name').order('name'),
      supabase.from('suppliers').select('id, name').order('name'),
      supabase.from('banks').select('id, name, type').order('name')
    ]);

    if (compRes.data) setCompanies(compRes.data);
    if (suppRes.data) setSuppliers(suppRes.data);
    if (bankRes.data) setBanks(bankRes.data);
  };

  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payables')
      .select(`
        id, description, amount, due_date, status, supplier_id, company_id, bank_id,
        supplier:suppliers(name),
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
    if (!description || !amount || !supplierId || !companyId || !bankId) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('payables').insert([{
      description,
      supplier_id: supplierId,
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
      setSupplierId('');
      setCompanyId('');
      setBankId('');
      fetchRecords();
    }
    setSaving(false);
  };

  const filteredRecords = records.filter(rec =>
    rec.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = filteredRecords.reduce((acc, rec) => acc + Number(rec.amount), 0);
  const overdueAmount = filteredRecords
    .filter(r => r.status === 'OVERDUE' || (new Date(r.due_date) < new Date() && r.status === 'PENDING'))
    .reduce((acc, rec) => acc + Number(rec.amount), 0);

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 dark:text-white text-4xl font-black tracking-tight">Contas a Pagar</h1>
          <p className="text-slate-600 dark:text-text-secondary text-base font-medium">Gerencie seus compromissos financeiros e mantenha o caixa em dia.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar lançamento..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 h-12 rounded-xl border border-slate-200 dark:border-surface-highlight bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm font-bold w-64 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
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

      <div className={`bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-highlight rounded-2xl p-8 shadow-sm ${isReadOnly ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-3 mb-8 border-b border-slate-200 dark:border-surface-highlight pb-6">
          <PlusCircle className="text-primary w-8 h-8" />
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Novo Lançamento</h3>
        </div>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-4 flex flex-col gap-2">
            <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Descrição</label>
            <input
              required
              className="w-full bg-slate-50 dark:bg-surface-darker border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold placeholder-slate-400"
              placeholder="Ex: Aluguel do escritório central"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-2">
            <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Fornecedor</label>
            <select
              required
              className="w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold appearance-none"
              value={supplierId}
              onChange={e => setSupplierId(e.target.value)}
            >
              <option value="" disabled>Selecione o fornecedor...</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-2">
            <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Empresa</label>
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

          <div className="lg:col-span-4 flex flex-col gap-2">
            <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Banco / Conta para Débito</label>
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
          <div className="lg:col-span-3 flex flex-col gap-2">
            <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Data de Vencimento</label>
            <input
              type="date"
              className="w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-2">
            <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Valor (R$)</label>
            <input
              required
              className="w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary text-right font-black"
              placeholder="0,00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>
          <div className="lg:col-span-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full h-12 bg-primary hover:bg-primary-hover text-background-dark font-black rounded-xl transition shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <PlusCircle className={`w-5 h-5 ${saving ? 'animate-spin' : ''}`} />
              {saving ? 'Salvando...' : 'Salvar Lançamento'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-highlight rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-surface-highlight flex flex-wrap justify-between items-center gap-6 bg-slate-50 dark:bg-surface-darker">
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">Contas Cadastradas</h3>
          <div className="flex gap-4">
            <span className="bg-slate-200 dark:bg-surface-highlight px-4 py-1.5 rounded-xl text-xs font-black text-slate-800 dark:text-text-secondary border border-black/5 dark:border-white/5 uppercase">
              TOTAL: {totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            {overdueAmount > 0 && (
              <span className="bg-danger/10 px-4 py-1.5 rounded-xl text-xs font-black text-danger border border-danger/20 uppercase tracking-widest">
                ATRASADO: {overdueAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center text-text-secondary font-bold uppercase tracking-widest">Carregando lançamentos...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-20 text-center text-text-secondary font-bold uppercase tracking-widest">Nenhum lançamento encontrado.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-surface-highlight/30 text-[10px] uppercase font-black tracking-[0.15em] text-slate-500 dark:text-text-secondary border-b border-slate-200 dark:border-surface-highlight">
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Descrição</th>
                  <th className="px-8 py-5">Fornecedor</th>
                  <th className="px-8 py-5">Empresa</th>
                  <th className="px-8 py-5 text-right">Valor</th>
                  <th className="px-8 py-5">Vencimento</th>
                  {!isReadOnly && <th className="px-8 py-5 text-center">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-surface-highlight text-sm font-bold">
                {filteredRecords.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-surface-highlight/20 transition-all group">
                    <td className="px-8 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${row.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-500/20' :
                        row.status === 'PAID' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-danger/10 text-danger border-danger/20'
                        }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 font-black text-slate-900 dark:text-white capitalize">{row.description}</td>
                    <td className="px-8 py-4 text-slate-600 dark:text-text-secondary">{row.supplier?.name}</td>
                    <td className="px-8 py-4 text-slate-500 dark:text-text-secondary text-[10px] font-black uppercase tracking-wider">{row.company?.name}</td>
                    <td className="px-8 py-4 text-right font-black text-slate-900 dark:text-white">
                      {Number(row.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-8 py-4 text-slate-900 dark:text-white whitespace-nowrap">
                      {new Date(row.due_date).toLocaleDateString('pt-BR')}
                    </td>
                    {!isReadOnly && (
                      <td className="px-8 py-4">
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ExportPayableModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={records}
        companies={companies}
        suppliers={suppliers}
        banks={banks}
      />

      <EditPayableModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedRecord(null);
        }}
        record={selectedRecord}
        companies={companies}
        suppliers={suppliers}
        banks={banks}
        onSuccess={fetchRecords}
        mode={modalMode}
      />
    </div>
  );
};

export default Payable;
