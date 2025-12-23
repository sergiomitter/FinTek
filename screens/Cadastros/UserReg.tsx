
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { generateTempPassword, formatPhone } from '../../utils/helpers';

const UserReg: React.FC = () => {
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

  const SENDER_EMAIL = 'suporte@sintektecnologia.com.br';

  useEffect(() => {
    const saved = localStorage.getItem('fingestao_users');
    if (saved) setUsers(JSON.parse(saved));
  }, []);

  const saveToStorage = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('fingestao_users', JSON.stringify(updatedUsers));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUserId) {
      // Update existing
      const updated = users.map(u => {
        if (u.id === editingUserId) {
          return { ...u, ...formData } as User;
        }
        return u;
      });
      saveToStorage(updated);
      alert('Dados do usuário atualizados com sucesso!');
    } else {
      // Create new
      const tempPass = generateTempPassword();
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        nome: formData.nome!,
        email: formData.email!,
        celular: formData.celular!,
        funcao: formData.funcao!,
        role: formData.role!,
        password: tempPass,
        isFirstAccess: true
      };

      saveToStorage([...users, newUser]);
      alert(`Usuário cadastrado!\n\nE-mail enviado por ${SENDER_EMAIL} para ${newUser.email}!\n\nSenha Provisória: ${tempPass}`);
    }

    closeForm();
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

  const handleManualPassword = (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    const newPass = prompt(`Definir nova senha manual para ${user.nome}:`);
    if (newPass && newPass.length >= 4) {
      const updated = users.map(u => {
        if (u.id === id) {
          return { ...u, password: newPass, isFirstAccess: false };
        }
        return u;
      });
      saveToStorage(updated);
      alert('Senha alterada manualmente com sucesso!');
    } else if (newPass) {
      alert('A senha deve ter pelo menos 4 caracteres.');
    }
  };

  const handleResetPassword = (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    if (confirm(`Deseja realmente RESETAR a senha de ${user.nome}? Uma nova senha será gerada e enviada por e-mail.`)) {
      const tempPass = generateTempPassword();
      const updated = users.map(u => {
        if (u.id === id) {
          return { ...u, password: tempPass, isFirstAccess: true };
        }
        return u;
      });

      saveToStorage(updated);
      alert(`SENHA RESETADA!\n\nE-mail de redefinição enviado por ${SENDER_EMAIL} para ${user.email}!\n\nNova Senha Provisória: ${tempPass}`);
    }
  };

  const handleDelete = (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    if (user.email === 'sergio@sintektecnologia.com.br') {
      alert('Este usuário é o administrador mestre e não pode ser removido.');
      return;
    }

    if (confirm(`Deseja realmente EXCLUIR o usuário ${user.nome}? Esta ação é irreversível.`)) {
      const updated = users.filter(u => u.id !== id);
      saveToStorage(updated);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Gestão de Usuários</h1>
          <p className="text-slate-600 dark:text-text-secondary text-base font-medium">Controle total de acessos e credenciais.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-8 h-12 rounded-xl bg-primary text-background-dark font-black shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] transition-all"
          >
            <span className="material-symbols-outlined">person_add</span> Novo Usuário
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-highlight rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
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
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-600 dark:text-text-secondary uppercase tracking-widest">Perfil de Acesso</label>
              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                  className={`flex-1 h-14 rounded-xl border-2 font-black text-xs tracking-widest transition-all ${formData.role === 'ADMIN' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-surface-highlight text-slate-400'}`}
                >
                  ADMINISTRADOR (ACESSO GERAL)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'USER' })}
                  className={`flex-1 h-14 rounded-xl border-2 font-black text-xs tracking-widest transition-all ${formData.role === 'USER' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-surface-highlight text-slate-400'}`}
                >
                  USUÁRIO (SOMENTE CONSULTA)
                </button>
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={closeForm}
                className="px-8 h-14 border border-slate-200 dark:border-surface-highlight text-slate-600 dark:text-text-secondary font-black rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
              >
                CANCELAR
              </button>
              <button className="px-12 h-14 bg-primary text-background-dark font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                {editingUserId ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR E ENVIAR SENHA'}
              </button>
            </div>
          </form>
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
                <th className="px-8 py-6 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-surface-highlight">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-900 dark:text-white text-sm">{u.nome}</p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-text-secondary uppercase tracking-wider">{u.funcao}</p>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-600 dark:text-slate-300">{u.email}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${u.role === 'ADMIN' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-200 dark:bg-surface-highlight text-slate-600 dark:text-text-secondary border-black/5 dark:border-white/5'}`}>
                      {u.role === 'ADMIN' ? 'Administrador' : 'Consulta'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {u.isFirstAccess ? (
                      <span className="flex items-center gap-2 text-[10px] font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-widest">
                        <span className="size-2 bg-yellow-500 rounded-full animate-pulse"></span> Pendente
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                        <span className="size-2 bg-primary rounded-full"></span> Definida
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(u)}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                        title="Editar Dados"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => handleManualPassword(u.id)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                        title="Alterar Senha Manualmente"
                      >
                        <span className="material-symbols-outlined text-lg">key</span>
                      </button>
                      <button
                        onClick={() => handleResetPassword(u.id)}
                        className="p-2 text-slate-400 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-xl transition-all"
                        title="Resetar Senha (E-mail)"
                      >
                        <span className="material-symbols-outlined text-lg">lock_reset</span>
                      </button>
                      {u.email !== 'sergio@sintektecnologia.com.br' && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                          title="Excluir Usuário"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      )}
                    </div>
                  </td>
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
