
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Save, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

interface EditPayableModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: any;
    companies: any[];
    suppliers: any[];
    banks: any[];
    onSuccess: () => void;
    mode?: 'edit' | 'delete';
}

const EditPayableModal: React.FC<EditPayableModalProps> = ({
    isOpen, onClose, record, companies, suppliers, banks, onSuccess, mode = 'edit'
}) => {
    const [description, setDescription] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [bankId, setBankId] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (record) {
            setDescription(record.description || '');
            setSupplierId(record.supplier_id || '');
            setCompanyId(record.company_id || '');
            setBankId(record.bank_id || '');
            setAmount(record.amount?.toString() || '');
            setDueDate(record.due_date || '');
            setStatus(record.status || 'PENDING');
            setShowConfirmDelete(mode === 'delete');
            setError(null);
        }
    }, [record, mode]);

    if (!isOpen || !record) return null;

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error: updateError } = await supabase
            .from('payables')
            .update({
                description,
                supplier_id: supplierId,
                company_id: companyId,
                bank_id: bankId,
                amount: parseFloat(amount.toString().replace(',', '.')),
                due_date: dueDate,
                status
            })
            .eq('id', record.id);

        if (updateError) {
            setError('Erro ao atualizar: ' + updateError.message);
        } else {
            onSuccess();
            onClose();
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        setLoading(true);
        setError(null);

        console.log('Tentando excluir registro:', record.id);

        const { error: deleteError } = await supabase
            .from('payables')
            .delete()
            .eq('id', record.id);

        if (deleteError) {
            console.error('Erro na exclusão Supabase:', deleteError);
            setError('Erro ao excluir: ' + deleteError.message);
        } else {
            console.log('Exclusão concluída com sucesso');
            onSuccess();
            onClose();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-surface-highlight animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-200 dark:border-surface-highlight flex justify-between items-center bg-slate-50 dark:bg-surface-highlight/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Save className="text-primary w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Editar Lançamento</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-surface-highlight rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-500 dark:text-text-secondary" />
                    </button>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3 text-danger font-bold text-sm">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {!showConfirmDelete ? (
                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                                    <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Descrição</label>
                                    <input required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Fornecedor</label>
                                    <select required value={supplierId} onChange={e => setSupplierId(e.target.value)} className="w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold appearance-none">
                                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Empresa</label>
                                    <select required value={companyId} onChange={e => setCompanyId(e.target.value)} className="w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold appearance-none">
                                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Banco</label>
                                    <select required value={bankId} onChange={e => setBankId(e.target.value)} className="w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold appearance-none">
                                        {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Status</label>
                                    <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold appearance-none">
                                        <option value="PENDING">PENDENTE</option>
                                        <option value="PAID">PAGO</option>
                                        <option value="OVERDUE">ATRASADO</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Vencimento</label>
                                    <input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Valor (R$)</label>
                                    <input required value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary text-right font-black" />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <button type="button" onClick={() => setShowConfirmDelete(true)} disabled={loading} className="flex-1 flex items-center justify-center gap-2 h-14 border-2 border-danger text-danger hover:bg-danger/10 font-black rounded-xl transition disabled:opacity-50">
                                    <Trash2 className="w-5 h-5" /> EXCLUIR
                                </button>
                                <button type="submit" disabled={loading} className="flex-[2] flex items-center justify-center gap-2 h-14 bg-primary hover:bg-primary-hover text-background-dark font-black rounded-xl transition shadow-lg shadow-primary/20 disabled:opacity-50">
                                    <CheckCircle className="w-5 h-5" /> {loading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in slide-in-from-bottom-4">
                            <div className="p-4 bg-danger/10 rounded-full">
                                <AlertTriangle className="w-16 h-16 text-danger" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Confirmar Exclusão?</h3>
                                <p className="text-slate-600 dark:text-text-secondary font-medium px-8">
                                    Esta ação não pode ser desfeita. O lançamento <strong className="text-slate-900 dark:text-white">"{description}"</strong> será removido permanentemente.
                                </p>
                            </div>
                            <div className="flex flex-col w-full gap-3 pt-6">
                                <button onClick={handleDelete} disabled={loading} className="w-full h-14 bg-danger hover:bg-rose-700 text-white font-black rounded-xl transition shadow-lg shadow-danger/20 flex items-center justify-center gap-2">
                                    <Trash2 className="w-5 h-5" /> {loading ? 'EXCLUINDO...' : 'CONFIRMAR EXCLUSÃO'}
                                </button>
                                <button onClick={() => setShowConfirmDelete(false)} disabled={loading} className="w-full h-14 bg-slate-100 dark:bg-surface-highlight hover:bg-slate-200 dark:hover:bg-opacity-80 text-slate-900 dark:text-white font-black rounded-xl transition">
                                    CANCELAR
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditPayableModal;
