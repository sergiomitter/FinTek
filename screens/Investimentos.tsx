
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Loader2,
  TrendingUp,
  DollarSign,
  Percent,
  Wallet,
  Eye,
  Check
} from 'lucide-react';

interface Investment {
  id: string;
  company_id: string;
  bank_id: string;
  description: string;
  amount: number;
  current_value: number;
  is_active: boolean;
  created_at: string;
  company?: { name: string };
  bank?: { name: string; account_type: string };
}

const Investimentos: React.FC<{ user: User }> = ({ user }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);

  const [formData, setFormData] = useState({
    company_id: '',
    bank_id: '',
    description: '',
    amount: '',
    current_value: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Fetch companies
    const { data: companiesData } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    // Fetch banks
    const { data: banksData } = await supabase
      .from('banks')
      .select('id, name, account_type')
      .eq('is_active', true)
      .order('name');

    // Fetch investments with joins
    const { data: investmentsData } = await supabase
      .from('investments')
      .select(`
        *,
        company:companies(name),
        bank:banks(name, account_type)
      `)
      .order('created_at', { ascending: false });

    if (companiesData) setCompanies(companiesData);
    if (banksData) setBanks(banksData);
    if (investmentsData) setInvestments(investmentsData);

    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      company_id: formData.company_id,
      bank_id: formData.bank_id,
      description: formData.description,
      amount: parseFloat(formData.amount),
      current_value: parseFloat(formData.current_value),
      is_active: true
    };

    let result;
    if (editingId) {
      result = await supabase
        .from('investments')
        .update(payload)
        .eq('id', editingId);
    } else {
      result = await supabase
        .from('investments')
        .insert([payload]);
    }

    if (result.error) {
      alert('Erro ao salvar: ' + result.error.message);
    } else {
      setShowForm(false);
      setEditingId(null);
      setFormData({ company_id: '', bank_id: '', description: '', amount: '', current_value: '' });
      fetchData();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, description: string) => {
    if (confirm(`Deseja realmente EXCLUIR o investimento "${description}"?`)) {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Erro ao excluir: ' + error.message);
      } else {
        fetchData();
      }
    }
  };

  const openEdit = (investment: Investment, viewOnly: boolean = false) => {
    setEditingId(investment.id);
    setIsViewOnly(viewOnly);
    setFormData({
      company_id: investment.company_id || '',
      bank_id: investment.bank_id || '',
      description: investment.description || '',
      amount: investment.amount.toString(),
      current_value: investment.current_value.toString()
    });
    setShowForm(true);
  };

  // Calculate KPIs
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + inv.current_value, 0);
  const totalProfit = totalCurrent - totalInvested;
  const profitPercent = totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(1) : '0.0';

  // Aggregate by institution type
  const byType = investments.reduce((acc: any, inv) => {
    const type = inv.bank?.account_type || 'OTHER';
    if (!acc[type]) acc[type] = 0;
    acc[type] += inv.amount;
    return acc;
  }, {});

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-surface-highlight">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-white tracking-tight">Carteira de Investimentos</h1>
          <p className="text-[#9db9a6] text-base font-normal">Acompanhe a rentabilidade e evolução do seu patrimônio.</p>
        </div>
        {(user.role === 'MASTER_ADMIN' || user.role === 'ADMIN') && (
          <button
            onClick={() => {
              if (showForm && !editingId) setShowForm(false);
              else {
                setEditingId(null);
                setIsViewOnly(false);
                setFormData({ company_id: '', bank_id: '', description: '', amount: '', current_value: '' });
                setShowForm(true);
              }
            }}
            className={`flex items-center gap-2 px-8 h-12 rounded-xl transition-all font-black text-sm shadow-lg ${showForm && !editingId ? 'bg-slate-200 text-slate-900' : 'bg-primary text-background-dark shadow-primary/20 hover:scale-[1.02]'}`}
          >
            {showForm && !editingId ? <><X className="w-5 h-5" /> CANCELAR</> : <><Plus className="w-5 h-5" /> NOVO APORTE</>}
          </button>
        )}
      </div>

      {showForm && (user.role === 'MASTER_ADMIN' || user.role === 'ADMIN') && (
        <div className="bg-surface-dark border border-surface-highlight rounded-2xl p-6 animate-in slide-in-from-top duration-300">
          <form onSubmit={handleSave} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-[10px] font-black text-[#9db9a6] uppercase tracking-[0.2em] ml-1">Empresa</label>
              <select
                required
                disabled={isViewOnly}
                title="Selecione a empresa"
                value={formData.company_id}
                onChange={(e) => setFormData(prev => ({ ...prev, company_id: e.target.value }))}
                className="w-full h-12 bg-surface-darker border border-surface-highlight rounded-xl px-4 text-white text-sm focus:border-primary/50 transition-all outline-none appearance-none disabled:opacity-50"
              >
                <option value="">Selecione a empresa</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-[10px] font-black text-[#9db9a6] uppercase tracking-[0.2em] ml-1">Instituição</label>
              <select
                required
                disabled={isViewOnly}
                title="Selecione a instituição"
                value={formData.bank_id}
                onChange={(e) => setFormData(prev => ({ ...prev, bank_id: e.target.value }))}
                className="w-full h-12 bg-surface-darker border border-surface-highlight rounded-xl px-4 text-white text-sm focus:border-primary/50 transition-all outline-none appearance-none disabled:opacity-50"
              >
                <option value="">Selecione a instituição</option>
                {banks.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.account_type})</option>
                ))}
              </select>
            </div>

            <div className="flex-[1.5] min-w-[240px] space-y-2">
              <label className="text-[10px] font-black text-[#9db9a6] uppercase tracking-[0.2em] ml-1">Ativo / Descrição</label>
              <input
                required
                disabled={isViewOnly}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full h-12 bg-surface-darker border border-surface-highlight rounded-xl px-4 text-white text-sm focus:border-primary/50 transition-all outline-none disabled:opacity-50"
                placeholder="Ex: CDB 100% CDI, PETR4"
              />
            </div>

            <div className="w-40 space-y-2">
              <label className="text-[10px] font-black text-[#9db9a6] uppercase tracking-[0.2em] ml-1">Valor Aporte</label>
              <input
                required
                disabled={isViewOnly}
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full h-12 bg-surface-darker border border-surface-highlight rounded-xl px-4 text-white text-sm text-right focus:border-primary/50 transition-all outline-none disabled:opacity-50"
                placeholder="0,00"
              />
            </div>

            <div className="w-40 space-y-2">
              <label className="text-[10px] font-black text-[#9db9a6] uppercase tracking-[0.2em] ml-1">Valor Atual</label>
              <input
                required
                disabled={isViewOnly}
                type="number"
                step="0.01"
                value={formData.current_value}
                onChange={(e) => setFormData(prev => ({ ...prev, current_value: e.target.value }))}
                className="w-full h-12 bg-surface-darker border border-surface-highlight rounded-xl px-4 text-white text-sm text-right focus:border-primary/50 transition-all outline-none disabled:opacity-50"
                placeholder="0,00"
              />
            </div>

            {!isViewOnly && (
              <button
                disabled={saving}
                className="h-12 px-8 bg-primary text-background-dark font-black rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> {editingId ? 'ATUALIZAR' : 'SALVAR'}</>}
              </button>
            )}
            {isViewOnly && (
              <button
                type="button"
                onClick={() => setIsViewOnly(false)}
                className="h-12 px-8 bg-slate-200 text-slate-900 font-black rounded-xl hover:bg-slate-300 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Edit3 className="w-4 h-4" /> HABILITAR EDIÇÃO
              </button>
            )}
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Investido', value: totalInvested, icon: DollarSign, color: 'primary' },
          { label: 'Bancos', value: byType.BANK || 0, icon: Wallet, color: 'primary' },
          { label: 'Corretoras', value: byType.BROKER || 0, icon: TrendingUp, color: 'primary' },
          { label: 'Exchanges', value: byType.EXCHANGE || 0, icon: Percent, color: 'warning' }
        ].map((stat, i) => (
          <div key={i} className="bg-surface-dark rounded-2xl p-8 border border-surface-highlight shadow-2xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
              <stat.icon className={`w-16 h-16 text-${stat.color}`} />
            </div>
            <p className="text-[#9db9a6] text-[10px] font-bold uppercase tracking-widest mb-2">{stat.label}</p>
            <p className="text-3xl font-black text-white tracking-tight">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stat.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-surface-dark rounded-2xl border border-surface-highlight overflow-hidden shadow-2xl">
        <div className="p-6 bg-[#152019] border-b border-surface-highlight">
          <h3 className="text-lg font-bold text-white">Carteira de Ativos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-highlight/30 text-[10px] uppercase font-black text-[#9db9a6] tracking-widest">
              <tr>
                <th className="px-8 py-5">Empresa</th>
                <th className="px-8 py-5">Instituição</th>
                <th className="px-8 py-5">Tipo</th>
                <th className="px-8 py-5 text-right">Investido</th>
                <th className="px-8 py-5 text-right">Atual</th>
                <th className="px-8 py-5 text-center">Rend.</th>
                <th className="px-8 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-highlight">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-10 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : investments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-10 text-center text-[#9db9a6]">Nenhum investimento cadastrado.</td>
                </tr>
              ) : (
                investments.map((inv) => {
                  const profit = inv.current_value - inv.amount;
                  const profitPct = inv.amount > 0 ? ((profit / inv.amount) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={inv.id} className="hover:bg-surface-highlight/10 transition-colors">
                      <td className="px-8 py-5 font-bold text-white text-sm">{inv.company?.name || '-'}</td>
                      <td className="px-8 py-5 font-bold text-white text-sm">{inv.bank?.name || '-'}</td>
                      <td className="px-8 py-5 text-[#9db9a6] text-xs font-bold uppercase">{inv.description}</td>
                      <td className="px-8 py-5 text-right text-[#9db9a6] text-sm">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.amount)}
                      </td>
                      <td className="px-8 py-5 text-right text-white font-black text-sm">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.current_value)}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black ${parseFloat(profitPct) >= 0 ? 'bg-primary/10 text-primary' : 'bg-danger/10 text-danger'}`}>
                          {parseFloat(profitPct) >= 0 ? '+' : ''}{profitPct}%
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              openEdit(inv, true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              openEdit(inv, false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(inv.id, inv.description)}
                            className="p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Investimentos;
