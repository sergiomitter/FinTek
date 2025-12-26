
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { X, FileSpreadsheet, FileText, Download } from 'lucide-react';

interface ExportPayableModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any[];
    companies: any[];
    suppliers: any[];
    banks: any[];
}

const ExportPayableModal: React.FC<ExportPayableModalProps> = ({
    isOpen, onClose, data, companies, suppliers, banks
}) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [bankId, setBankId] = useState('');
    const [status, setStatus] = useState('');

    if (!isOpen) return null;

    const getFilteredData = () => {
        return data.filter(item => {
            const date = new Date(item.due_date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            const matchDate = (!start || date >= start) && (!end || date <= end);
            const matchCompany = !companyId || item.company_id === companyId;
            const matchSupplier = !supplierId || item.supplier_id === supplierId;
            const matchBank = !bankId || item.bank_id === bankId;
            const matchStatus = !status || item.status === status;

            return matchDate && matchCompany && matchSupplier && matchBank && matchStatus;
        });
    };

    const handleExportExcel = () => {
        const filtered = getFilteredData();
        const exportData = filtered.map(item => ({
            Descrição: item.description,
            Fornecedor: item.supplier?.name || '',
            Empresa: item.company?.name || '',
            Banco: item.bank?.name || '',
            Vencimento: new Date(item.due_date).toLocaleDateString('pt-BR'),
            Valor: item.amount,
            Status: item.status
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Lançamentos');
        XLSX.writeFile(wb, `FinTek_Lancamentos_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleExportPDF = () => {
        const filtered = getFilteredData();
        const doc = new jsPDF() as any;

        doc.text('FinTek - Relatório de Contas a Pagar', 14, 15);

        const tableData = filtered.map(item => [
            item.description,
            item.supplier?.name || '',
            new Date(item.due_date).toLocaleDateString('pt-BR'),
            item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            item.status
        ]);

        doc.autoTable({
            head: [['Descrição', 'Fornecedor', 'Vencimento', 'Valor', 'Status']],
            body: tableData,
            startY: 25,
            theme: 'grid',
            headStyles: { fillColor: [45, 66, 52] }
        });

        doc.save(`FinTek_Relatorio_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-surface-highlight animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-200 dark:border-surface-highlight flex justify-between items-center bg-slate-50 dark:bg-surface-highlight/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Download className="text-primary w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Exportar Lançamentos</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-surface-highlight rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-500 dark:text-text-secondary" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Data Início</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Data Fim</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Empresa</label>
                            <select
                                value={companyId}
                                onChange={e => setCompanyId(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold appearance-none"
                            >
                                <option value="">Todas as Empresas</option>
                                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Banco</label>
                            <select
                                value={bankId}
                                onChange={e => setBankId(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold appearance-none"
                            >
                                <option value="">Todos os Bancos</option>
                                {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em]">Status</label>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-[#111813] border border-slate-200 dark:border-surface-highlight rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold appearance-none"
                            >
                                <option value="">Todos os Status</option>
                                <option value="PENDING">PENDENTE</option>
                                <option value="PAID">PAGO</option>
                                <option value="OVERDUE">ATRASADO</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center justify-center gap-3 h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition shadow-lg shadow-emerald-500/20"
                        >
                            <FileSpreadsheet className="w-5 h-5" />
                            EXCEL (.XLSX)
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center justify-center gap-3 h-14 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl transition shadow-lg shadow-rose-500/20"
                        >
                            <FileText className="w-5 h-5" />
                            PDF (.PDF)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportPayableModal;
