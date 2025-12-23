
import React, { useState } from 'react';
import { validateCPF, formatCPF } from '../../utils/helpers';
// Fix: Import User type
import { User } from '../../types';

// Fix: Add user prop
const PeopleReg: React.FC<{ user: User }> = ({ user }) => {
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatCPF(e.target.value);
    setCpf(value);
    setError('');

    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length === 11) {
      if (!validateCPF(cleanValue)) {
        setError('CPF Inválido');
      }
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-[960px] mx-auto space-y-10">
      <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-surface-highlight pb-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Cadastro de Pessoa</h1>
        <p className="text-slate-600 dark:text-text-secondary text-base font-medium">Gerencie registros de pessoas físicas para faturamento e pagamentos.</p>
      </div>

      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-highlight rounded-2xl p-8 shadow-sm">
        <form className="space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-surface-highlight pb-4">
              <span className="material-symbols-outlined text-primary">person</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Dados Pessoais</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-text-secondary uppercase tracking-widest">Nome Completo</label>
                <input
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-surface-darker px-4 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary font-bold"
                  placeholder="Ex: João da Silva"
                />
              </div>
              <div className="md:col-span-4 space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-[#9db9a6] uppercase tracking-widest">CPF</label>
                <input
                  value={cpf}
                  onChange={handleCPFChange}
                  className={`h-12 w-full rounded-xl border ${error ? 'border-danger' : 'border-slate-200 dark:border-surface-highlight'} bg-slate-50 dark:bg-[#111813] px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold`}
                  placeholder="000.000.000-00"
                />
                {error && <p className="text-[10px] text-danger font-black uppercase tracking-wider">{error}</p>}
              </div>
              <div className="md:col-span-4 space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-[#9db9a6] uppercase tracking-widest">Data Nasc.</label>
                <input className="h-12 w-full rounded-xl border border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-[#111813] px-4 text-slate-900 dark:text-white font-bold" type="date" />
              </div>
              <div className="md:col-span-8 space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-[#9db9a6] uppercase tracking-widest">Email</label>
                <input className="h-12 w-full rounded-xl border border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-[#111813] px-4 text-slate-900 dark:text-white font-bold" type="email" placeholder="joao@email.com" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t border-slate-200 dark:border-surface-highlight">
            {user.role === 'MASTER_ADMIN' && (
              <button className="h-12 px-10 rounded-xl bg-primary text-background-dark font-black shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all uppercase tracking-widest text-xs">
                Salvar Registro
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PeopleReg;
