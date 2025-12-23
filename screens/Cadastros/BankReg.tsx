
import React, { useState } from 'react';
// Fix: Import User type
import { User } from '../../types';

// Fix: Add user prop
const BankReg: React.FC<{ user: User }> = ({ user }) => {
  const [selectedBank, setSelectedBank] = useState<string>('001');
  const [customBankName, setCustomBankName] = useState<string>('');

  const banks = [
    { code: '001', name: '001 - Banco do Brasil' },
    { code: '260', name: '260 - Nubank' },
    { code: '077', name: '077 - Banco Inter' },
    { code: 'OTHER', name: 'Outro...' }
  ];

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-black text-white tracking-tight">Nova Conta Bancária</h1>
        <p className="text-[#9db9a6] text-base">Adicione suas contas para possibilitar o controle de saldos e conciliação.</p>
      </div>

      <div className="bg-surface-dark border border-surface-highlight rounded-2xl p-8 shadow-2xl space-y-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-surface-highlight pb-4">
            <span className="material-symbols-outlined text-primary">account_balance</span>
            <h3 className="text-lg font-bold text-white">Informações da Conta</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-2">
              <label className="text-xs font-bold text-[#9db9a6] uppercase tracking-widest">Banco / Instituição</label>
              <select 
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="h-12 w-full rounded-xl border border-surface-highlight bg-[#111813] px-4 text-white focus:ring-1 focus:ring-primary appearance-none"
              >
                {banks.map(bank => (
                  <option key={bank.code} value={bank.code}>{bank.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9db9a6] uppercase tracking-widest">Agência</label>
              <input className="h-12 w-full rounded-xl border border-surface-highlight bg-[#111813] px-4 text-white" placeholder="0001-X" />
            </div>

            {selectedBank === 'OTHER' && (
              <div className="lg:col-span-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold text-primary uppercase tracking-widest">Nome do Novo Banco</label>
                <input 
                  value={customBankName}
                  onChange={(e) => setCustomBankName(e.target.value)}
                  className="h-12 w-full rounded-xl border border-primary/50 bg-[#111813] px-4 text-white focus:ring-1 focus:ring-primary" 
                  placeholder="Digite o nome da instituição financeira" 
                />
              </div>
            )}

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-[#9db9a6] uppercase tracking-widest">Número da Conta</label>
              <input className="h-12 w-full rounded-xl border border-surface-highlight bg-[#111813] px-4 text-white" placeholder="00000000-0" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#9db9a6] uppercase tracking-widest">Saldo Inicial</label>
              <input className="h-12 w-full rounded-xl border border-surface-highlight bg-[#111813] px-4 text-white text-right font-black" placeholder="R$ 0,00" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-8 border-t border-surface-highlight">
          <button className="px-10 h-12 rounded-xl bg-primary text-background-dark font-black shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
            Salvar Conta
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankReg;
