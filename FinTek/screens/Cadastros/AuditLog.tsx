
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User } from '../../types';
import { Search, Filter, Clock, User as UserIcon, Database, ArrowLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuditLog {
    id: string;
    timestamp: string;
    user_email: string;
    table_name: string;
    action: string;
    old_data: any;
    new_data: any;
}

const AuditLogViewer: React.FC<{ user: User }> = ({ user }) => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [tableFilter, setTableFilter] = useState('all');
    const [actionFilter, setActionFilter] = useState('all');
    const [page, setPage] = useState(0);
    const pageSize = 20;

    useEffect(() => {
        fetchLogs();
    }, [page, tableFilter, actionFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        let query = supabase
            .from('audit_logs')
            .select('*', { count: 'exact' })
            .order('timestamp', { ascending: false })
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (tableFilter !== 'all') {
            query = query.eq('table_name', tableFilter);
        }
        if (actionFilter !== 'all') {
            query = query.eq('action', actionFilter);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching audit logs:', error);
        } else {
            setLogs(data || []);
        }
        setLoading(false);
    };

    const filteredLogs = logs.filter(log =>
        log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.table_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getActionColor = (action: string) => {
        switch (action) {
            case 'INSERT': return 'bg-primary/10 text-primary border-primary/20';
            case 'UPDATE': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'DELETE': return 'bg-danger/10 text-danger border-danger/20';
            case 'LOCKOUT': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const formatJSON = (data: any) => {
        if (!data) return 'N/A';
        return JSON.stringify(data, null, 2);
    };

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <Link to="/" className="text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors">Home</Link>
                        <span className="text-slate-300 dark:text-surface-highlight">/</span>
                        <span className="text-primary font-bold">Logs de Auditoria</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Logs do Sistema</h1>
                    <p className="text-slate-600 dark:text-text-secondary text-base">Rastreabilidade completa de todas as operações de banco de dados.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por e-mail..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-11 pr-4 h-12 rounded-xl border border-slate-200 dark:border-surface-highlight bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm font-bold w-64 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                        />
                    </div>
                    <select
                        value={tableFilter}
                        onChange={e => { setTableFilter(e.target.value); setPage(0); }}
                        className="h-12 px-4 rounded-xl border border-slate-200 dark:border-surface-highlight bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm font-bold outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    >
                        <option value="all">Todas as Tabelas</option>
                        <option value="companies">Empresas</option>
                        <option value="profiles">Usuários</option>
                        <option value="payables">Contas a Pagar</option>
                        <option value="receivables">Contas a Receber</option>
                    </select>
                    <select
                        value={actionFilter}
                        onChange={e => { setActionFilter(e.target.value); setPage(0); }}
                        className="h-12 px-4 rounded-xl border border-slate-200 dark:border-surface-highlight bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm font-bold outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    >
                        <option value="all">Todas as Ações</option>
                        <option value="INSERT">Inserção</option>
                        <option value="UPDATE">Alteração</option>
                        <option value="DELETE">Exclusão</option>
                        <option value="LOCKOUT">Bloqueio</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-highlight rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-surface-highlight/30 text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-text-secondary border-b border-slate-200 dark:border-surface-highlight">
                                <th className="px-8 py-6">Data / Hora</th>
                                <th className="px-8 py-6">Usuário</th>
                                <th className="px-8 py-6">Tabela / Recurso</th>
                                <th className="px-8 py-6">Ação</th>
                                <th className="px-8 py-6 text-center">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-surface-highlight">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                            <p className="text-slate-400 font-bold uppercase tracking-widest italic">Carregando auditoria...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest italic">Nenhum registro de log encontrado.</td>
                                </tr>
                            ) : filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                {new Date(log.timestamp).toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-black text-slate-900 dark:text-white">{log.user_email || 'Sistema'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <Database className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs font-bold text-slate-500 dark:text-[#9db9a6] uppercase tracking-wider">{log.table_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <button
                                            onClick={() => alert(`Dados Anteriores:\n${formatJSON(log.old_data)}\n\nNovos Dados:\n${formatJSON(log.new_data)}`)}
                                            className="px-4 py-2 bg-slate-100 dark:bg-surface-highlight text-slate-600 dark:text-text-secondary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 hover:text-primary transition-all"
                                        >
                                            Ver JSON
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-surface-highlight/10 border-t border-slate-200 dark:border-surface-highlight flex justify-between items-center">
                    <p className="text-xs font-bold text-slate-500">Página {page + 1}</p>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            className="p-2 rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-highlight disabled:opacity-30 hover:bg-slate-50 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-white" />
                        </button>
                        <button
                            disabled={logs.length < pageSize}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-highlight disabled:opacity-30 hover:bg-slate-50 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogViewer;
