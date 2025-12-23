
import React, { useState } from 'react';
import { validateCNPJ, formatCNPJ } from '../../utils/helpers';
// Fix: Import User type
import { User } from '../../types';

// Fix: Add user prop
const SupplierReg: React.FC<{ user: User }> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    doc: '',
    name: '',
    email: ''
  });

  const handleDocChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatCNPJ(e.target.value);
    setFormData(prev => ({ ...prev, doc: value }));
    setError('');

    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length === 14) {
      if (!validateCNPJ(cleanValue)) {
        setError('CNPJ Inválido');
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanValue}`);
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          name: data.razao_social || '',
          email: data.email || ''
        }));
      } catch (err) {
        setError('Dados não encontrados');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-10">
      <div className="flex justify-between items-end gap-6 border-b border-slate-200 dark:border-surface-highlight pb-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Novo Fornecedor</h2>
          <p className="text-slate-600 dark:text-text-secondary text-base font-medium">Registre parceiros comerciais. Informe o CNPJ para preenchimento rápido.</p>
        </div>
        <button className="px-8 h-12 rounded-xl bg-primary text-background-dark font-black shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all uppercase tracking-widest text-xs">
          Salvar
        </button>
      </div>

      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-highlight rounded-2xl p-8 shadow-sm">
        <form className="space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-surface-highlight pb-4">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Dados Básicos</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-[#9db9a6] uppercase tracking-widest">CNPJ / CPF</label>
                <div className="relative">
                  <input 
                    value={formData.doc}
                    onChange={handleDocChange}
                    className={`h-12 w-full bg-slate-50 dark:bg-[#111813] border ${error ? 'border-danger' : 'border-slate-200 dark:border-surface-highlight'} rounded-xl px-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary`} 
                    placeholder="00.000.000/0001-00" 
                  />
                  {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
                </div>
                {error && <p className="text-[10px] text-danger font-black uppercase tracking-wider">{error}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-[#9db9a6] uppercase tracking-widest">Razão Social / Nome</label>
                <input 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="h-12 w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl px-4 text-slate-900 dark:text-white font-bold focus:ring-1 focus:ring-primary" 
                  placeholder="Fornecedor Ltda" 
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-[#9db9a6] uppercase tracking-widest">Email de Contato</label>
                <input 
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="h-12 w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl px-4 text-slate-900 dark:text-white font-bold focus:ring-1 focus:ring-primary" 
                  type="email" 
                  placeholder="comercial@fornecedor.com" 
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierReg;
