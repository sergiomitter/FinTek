
// Force Deployment Trigger - V1.1
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { generateTempPassword, formatPhone } from '../../utils/helpers';
import { createClient } from '@supabase/supabase-js';
import { supabase, supabaseUrl, supabaseAnonKey } from '../../lib/supabase';
import { UserPlus, Edit3, Trash2, ShieldCheck, Lock, Unlock, Mail, Loader2, X, Search, Eye, EyeOff } from 'lucide-react';

const UserReg: React.FC<{ user: User }> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    nome: '',
    email: '',
    celular: '',
    funcao: '',
    role: 'USER'
  });
  const [showManualPassword, setShowManualPassword] = useState(false);

  const SENDER_EMAIL = 'suporte@sintektecnologia.com.br';
  const SYSTEM_LINK = window.location.origin;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('nome');

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers((data || []).map(p => ({
        id: p.id,
        nome: p.nome,
        email: p.email,
        celular: p.celular,
        funcao: p.funcao,
        role: p.role as UserRole,
        isFirstAccess: false, // We'll assume if they are in profiles they are defined, but auth handles this
        status: p.is_blocked ? 'BLOCKED' : 'ACTIVE'
      })));
    }
    setFetching(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingUserId) {
        // 1. Update basic info via RPC
        const { error: rpcError } = await supabase.rpc('manage_user', {
          target_user_id: editingUserId,
          action: 'UPDATE',
          new_data: {
            nome: formData.nome,
            celular: formData.celular,
            funcao: formData.funcao,
            role: formData.role
          }
        });

        if (rpcError) throw rpcError;

        // 2. If password was entered manually, update it via Edge Function
        // Note: We use 'any' cast for formData to access newPassword which we will add shortly
        const newPass = (formData as any).newPassword;
        if (newPass && newPass.trim() !== '') {
          const { data: pwdData, error: pwdError } = await supabase.functions.invoke('reset-password', {
            body: {
              userId: editingUserId,
              action: 'ADMIN_UPDATE_PASSWORD',
              newPassword: newPass.trim()
            }
          });

          if (pwdError) throw pwdError;
          if (!pwdData.success) throw new Error(pwdData.error || 'Erro ao atualizar senha.');
        }

        alert('Dados do usuário atualizados com sucesso!');
      } else {
        const tempPass = generateTempPassword();

        // Invoke the Edge Function to create user and send email
        const { data: fnData, error: fnError } = await supabase.functions.invoke('send-user-invite', {
          body: {
            email: formData.email,
            nome: formData.nome,
            role: formData.role,
            celular: formData.celular,
            funcao: formData.funcao,
            tempPassword: tempPass
          }
        });

        if (fnError) throw new Error(fnError.message || 'Erro ao processar convite');

        if (fnData?.error) throw new Error(fnData.error);

        // Success Feedback
        if (fnData?.warning) {
          alert(`AVISO: ${fnData.warning}\n\nO usuário foi criado, mas houve um problema com o email. Detalhes: ${fnData.details}`);
        } else {
          alert(
            `CONVITE ENVIADO COM SUCESSO!\n\n` +
            `Um e-mail de boas-vindas foi enviado para ${formData.email} com os dados de acesso.\n\n` +
            `Dados de Contingência (caso o e-mail não chegue):\n` +
            `Usuário: ${formData.nome}\n` +
            `Senha Provisória: ${tempPass}`
          );
        }
      }

      closeForm();
      // Wait a bit for trigger to complete before fetching
      setTimeout(fetchUsers, 1000);
    } catch (err: any) {
      alert('Erro ao processar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUserId(null);
    setFormData({ nome: '', email: '', celular: '', funcao: '', role: 'USER' });
  };

  const handleEdit = (user: User) => {
    setFormData({
      nome: user.nome,
      email: user.email,
      celular: user.celular,
      funcao: user.funcao,
      role: user.role
    });
    setEditingUserId(user.id);
    setShowForm(true);
  };

  const handleToggleBlock = async (user: User) => {
    const newBlockedState = user.status !== 'BLOCKED';
    const actionLabel = newBlockedState ? 'BLOQUEAR' : 'DESBLOQUEAR';

    if (user.role === 'MASTER_ADMIN') {
      alert('Administradores Master não podem ser bloqueados.');
      return;
    }

    if (confirm(`Deseja realmente ${actionLabel} o usuário ${user.nome}?`)) {
      setLoading(true);
      const { data, error } = await supabase.rpc('manage_user', {
        target_user_id: user.id,
        action: newBlockedState ? 'BLOCK' : 'UNBLOCK'
      });

      if (error) {
        alert('Erro ao atualizar status: ' + error.message);
      } else {
        fetchUsers();
      }
      setLoading(false);
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    if (confirm(`Deseja resetar a senha de ${name}? O usuário receberá um e-mail com uma nova senha temporária.`)) {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('reset-password', {
          body: { userId: id, action: 'ADMIN_RESET' }
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error || 'Falha no reset.');

        alert(`Senha resetada com sucesso! O e-mail foi enviado para ${name}.`);
      } catch (err: any) {
        alert('Erro ao resetar senha: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: string, name: string, role: string) => {
    if (role === 'MASTER_ADMIN') {
      alert('Administradores Master não podem ser removidos.');
      return;
    }

    if (confirm(`Deseja realmente EXCLUIR o usuário ${name}? Esta ação removerá o perfil e o acesso definitivamente.`)) {
      setLoading(true);
      const { data, error } = await supabase.rpc('manage_user', {
        target_user_id: id,
        action: 'DELETE'
      });

      if (error) {
        alert('Erro ao excluir usuário: ' + error.message);
      } else {
        fetchUsers();
      }
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Gestão de Usuários</h1>
          <p className="text-slate-600 dark:text-text-secondary text-base font-medium">Controle total de acessos e credenciais.</p>
        </div>
        {!showForm && user.role === 'MASTER_ADMIN' && (
          <button
            onClick={() => setShowForm(true)}
            className="px-8 h-12 rounded-xl bg-primary text-background-dark font-black shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] transition-all"
          >
            <span className="material-symbols-outlined">person_add</span> Novo Usuário
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-highlight rounded-3xl p-8 shadow-2xl w-full max-w-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-10 border-b border-slate-100 dark:border-surface-highlight pb-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {editingUserId ? 'Editar Usuário' : 'Novo Cadastro'}
              </h3>
              <button onClick={closeForm} className="text-slate-400 hover:text-danger transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-600 dark:text-text-secondary uppercase tracking-widest">Nome Completo</label>
                <input
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  className="h-12 w-full rounded-xl border border-slate-200 dark:border-surface-highlight bg-slate-50 dark:bg-surface-darker px-4 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary font-bold"
                  placeholder="Ex: João Silva"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 dark:text-text-secondary uppercase tracking-widest">E-mail (Login)</label>
                <input
                  type="email"
                  required
                  className="w-full h-12 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-surface-highlight rounded-xl px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 dark:text-text-secondary uppercase tracking-widest">Celular</label>
                <input
                  className="w-full h-12 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-surface-highlight rounded-xl px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold"
                  value={formData.celular}
                  onChange={e => setFormData({ ...formData, celular: formatPhone(e.target.value) })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 dark:text-text-secondary uppercase tracking-widest">Função / Cargo</label>
                <input
                  className="w-full h-12 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-surface-highlight rounded-xl px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold"
                  value={formData.funcao}
                  onChange={e => setFormData({ ...formData, funcao: e.target.value })}
                />
              </div>

              {/* Manual Password Reset Field - Added as requested */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-600 dark:text-text-secondary uppercase tracking-widest">
                  Nova Senha Manual (Opcional)
                </label>
                <div className="relative">
                  <input
                    type={showManualPassword ? "text" : "password"}
                    className="w-full h-12 bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-surface-highlight rounded-xl pl-4 pr-12 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary font-bold placeholder:font-normal placeholder:text-slate-400"
                    placeholder="Digite para alterar a senha (sem enviar e-mail)..."
                    value={(formData as any).newPassword || ''}
                    onChange={e => setFormData({ ...formData, newPassword: e.target.value } as any)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowManualPassword(!showManualPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors flex items-center"
                  >
                    {showManualPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1 ml-1">Deixe em branco para manter a senha atual.</p>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-600 dark:text-text-secondary uppercase tracking-widest">Perfil de Acesso</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'MASTER_ADMIN' })}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${formData.role === 'MASTER_ADMIN' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-surface-highlight text-slate-400'}`}
                  >
                    <ShieldCheck className="w-5 h-5 mb-1" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Master Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${formData.role === 'ADMIN' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-surface-highlight text-slate-400'}`}
                  >
                    <Edit3 className="w-5 h-5 mb-1" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Administrador</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'USER' })}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${formData.role === 'USER' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-surface-highlight text-slate-400'}`}
                  >
                    <Search className="w-5 h-5 mb-1" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Usuário</span>
                  </button>
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-8 h-12 border border-slate-200 dark:border-surface-highlight text-slate-600 dark:text-text-secondary font-black rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-xs tracking-widest"
                >
                  CANCELAR
                </button>
                <button
                  disabled={saving}
                  className="px-10 h-12 bg-primary text-background-dark font-black rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : editingUserId ? 'SALVAR ALTERAÇÕES' : 'ENVIAR CONVITE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-highlight rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-surface-highlight/30 text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-text-secondary border-b border-slate-200 dark:border-surface-highlight">
                <th className="px-8 py-6">Nome</th>
                <th className="px-8 py-6">E-mail / Login</th>
                <th className="px-8 py-6">Perfil</th>
                <th className="px-8 py-6">Status Senha</th>
                {user.role === 'MASTER_ADMIN' && <th className="px-8 py-6 text-center">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-surface-highlight">
              {fetching ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse italic">Sincronizando com Supabase...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest italic">Nenhum usuário cadastrado em profiles.</td>
                </tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-900 dark:text-white text-sm">{u.nome}</p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-text-secondary uppercase tracking-wider">{u.funcao}</p>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-600 dark:text-slate-300">{u.email}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${u.role === 'MASTER_ADMIN' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : u.role === 'ADMIN' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-200 dark:bg-surface-highlight text-slate-600 dark:text-text-secondary border-black/5 dark:border-white/5'}`}>
                      {u.role === 'MASTER_ADMIN' ? 'Master Admin' : u.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {u.status === 'BLOCKED' ? (
                      <span className="flex items-center gap-2 text-[10px] font-black text-danger uppercase tracking-widest">
                        <Lock className="w-3 h-3" /> Bloqueado
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                        <ShieldCheck className="w-3 h-3" /> Ativo
                      </span>
                    )}
                  </td>
                  {user.role === 'MASTER_ADMIN' && (
                    <td className="px-8 py-5 text-center">
                      <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(u)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                          title="Editar Dados"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleBlock(u)}
                          className={`p-2 rounded-xl transition-all ${u.status === 'BLOCKED' ? 'text-green-500 hover:bg-green-500/10' : 'text-slate-400 hover:text-danger hover:bg-danger/10'}`}
                          title={u.status === 'BLOCKED' ? 'Desbloquear' : 'Bloquear'}
                        >
                          {u.status === 'BLOCKED' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.nome, u.role)}
                          className="p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                          title="Excluir Perfil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(u.id, u.nome)}
                          className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"
                          title="Resetar Senha"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserReg;
