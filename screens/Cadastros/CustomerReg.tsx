
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { validateCNPJ, formatCNPJ, formatCEP } from '../../utils/helpers';
// Fix: Import User type
import { User } from '../../types';

// Fix: Add user prop
const CustomerReg: React.FC<{ user: User }> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    cnpj: '',
    nome: '',
    cep: '',
    logradouro: '',
    bairro: '',
    cidade: '',
    uf: ''
  });

  const handleCNPJChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatCNPJ(e.target.value);
    setFormData(prev => ({ ...prev, cnpj: value }));
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
        if (!response.ok) throw new Error();
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          nome: data.razao_social || '',
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          cidade: data.municipio || prev.cidade,
          uf: data.uf || prev.uf,
          cep: data.cep ? formatCEP(data.cep) : prev.cep
        }));
      } catch (err) {
        setError('Dados não encontrados para este CNPJ');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatCEP(e.target.value);
    setFormData(prev => ({ ...prev, cep: value }));

    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length === 8) {
      setLoadingCEP(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanValue}/json/`);
        const data = await response.json();
        if (data.erro) throw new Error();
        setFormData(prev => ({
          ...prev,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          uf: data.uf || ''
        }));
      } catch (err) {
        console.error('CEP não encontrado');
      } finally {
        setLoadingCEP(false);
      }
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-[1024px] mx-auto space-y-10">
      <div className="flex items-center gap-2 text-sm">
        <Link to="/" className="text-slate-500 dark:text-[#9db9a6] hover:text-slate-900 dark:hover:text-white transition-colors">Home</Link>
        <span className="text-slate-300 dark:text-surface-highlight">/</span>
        <span className="text-primary font-bold">Cadastro de Cliente</span>
      </div>

      <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-surface-highlight pb-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Novo Cliente</h1>
        <p className="text-slate-600 dark:text-text-secondary text-base font-normal">Ao informar o CNPJ ou CEP, os dados serão preenchidos automaticamente.</p>
      </div>

      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-highlight rounded-2xl p-8 shadow-sm">
        <form className="space-y-12">
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-surface-highlight pb-4">
              <span className="material-symbols-outlined text-primary text-2xl">group</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Dados Principais</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4 space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-[#9db9a6] uppercase tracking-widest">CNPJ</label>
                <div className="relative">
                  <input
                    value={formData.cnpj}
                    onChange={handleCNPJChange}
                    className={`h-12 w-full rounded-xl border ${error ? 'border-danger' : 'border-slate-200 dark:border-surface-highlight'} bg-slate-50 dark:bg-[#111813] px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold`}
                    placeholder="00.000.000/0000-00"
                  />
                  {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
                </div>
                {error && <p className="text-[10px] text-danger font-black uppercase tracking-wider">{error}</p>}
              </div>
              <div className="md:col-span-8 space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-[#9db9a6] uppercase tracking-widest">Nome do Cliente / Razão Social</label>
                <input
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-[#111813] px-4 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary font-bold"
                  placeholder="Nome completo ou Razão Social"
                />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-surface-highlight pb-4">
              <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Endereço Completo</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-3 space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-text-secondary uppercase tracking-widest">CEP</label>
                <div className="relative">
                  <input
                    value={formData.cep}
                    onChange={handleCEPChange}
                    className="h-12 w-full rounded-xl border border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-[#111813] px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold"
                    placeholder="00000-000"
                  />
                  {loadingCEP && <div className="absolute right-3 top-1/2 -translate-y-1/2 size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
                </div>
              </div>
              <div className="md:col-span-9 space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-text-secondary uppercase tracking-widest">Logradouro (Rua, Av.)</label>
                <input
                  value={formData.logradouro}
                  onChange={(e) => setFormData(prev => ({ ...prev, logradouro: e.target.value }))}
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-[#111813] px-4 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary font-bold"
                  placeholder="Rua das Flores, 123"
                />
              </div>
              <div className="md:col-span-5 space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-[#9db9a6] uppercase tracking-widest">Bairro</label>
                <input
                  value={formData.bairro}
                  onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-[#111813] px-4 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary font-bold"
                  placeholder="Centro"
                />
              </div>
              <div className="md:col-span-5 space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-[#9db9a6] uppercase tracking-widest">Cidade</label>
                <input
                  value={formData.cidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-[#111813] px-4 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary font-bold"
                  placeholder="São Paulo"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-[#9db9a6] uppercase tracking-widest">UF</label>
                <input
                  value={formData.uf}
                  onChange={(e) => setFormData(prev => ({ ...prev, uf: e.target.value }))}
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-[#111813] px-4 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary font-bold text-center"
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-8 border-t border-slate-200 dark:border-surface-highlight">
            <button type="button" className="px-8 h-12 rounded-xl border border-slate-200 dark:border-surface-highlight text-slate-900 dark:text-white font-black hover:bg-slate-100 dark:hover:bg-white/5 transition-all uppercase tracking-widest text-xs">Cancelar</button>
            <button className="px-10 h-12 rounded-xl bg-primary text-background-dark font-black shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary-hover transition-all">
              <span className="material-symbols-outlined">save</span> Salvar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerReg;
