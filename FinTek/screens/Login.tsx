
import React, { useState } from 'react';
import { validatePassword } from '../utils/helpers';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'LOGIN' | 'FORGOT' | 'FIRST_ACCESS'>('LOGIN');

  const [tempUser, setTempUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  /* New Effect to clean fields on mount and view change */
  React.useEffect(() => {
    setEmail('');
    setPassword('');
    setForgotEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  }, [view]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Check if user is blocked first
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (profile && profile.is_blocked) {
        throw new Error('Esta conta está bloqueada por excesso de tentativas ou por um administrador. Contate o suporte.');
      }

      // 2. Attempt login
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Increment failed attempts
        if (profile) {
          const newAttempts = (profile.failed_attempts || 0) + 1;
          const isNowBlocked = newAttempts >= 3;

          await supabase
            .from('profiles')
            .update({
              failed_attempts: newAttempts,
              is_blocked: isNowBlocked
            })
            .eq('id', profile.id);

          if (isNowBlocked) {
            // Log highly critical lockout
            await supabase.from('audit_logs').insert({
              user_email: email,
              table_name: 'auth',
              action: 'LOCKOUT',
              new_data: { reason: '3 failed attempts', email: email }
            });
            throw new Error('Conta bloqueada após 3 tentativas inválidas.');
          }
        }
        throw new Error('E-mail ou senha incorretos.');
      }

      // 3. Reset attempts on success
      if (profile) {
        await supabase
          .from('profiles')
          .update({ failed_attempts: 0 })
          .eq('id', profile.id);

        // 4. CHECK FIRST ACCESS FORCE
        if (profile.is_first_access) {
          const user: User = {
            id: data.user.id,
            nome: profile.nome || 'Usuário',
            email: profile.email || '',
            celular: profile.celular || '',
            funcao: profile.funcao || '',
            role: (profile.role as UserRole) || 'USER',
            isFirstAccess: true,
            status: 'ACTIVE'
          };
          setTempUser(user);
          setView('FIRST_ACCESS');
          return; // Stop here, do not finish login flow until password changed
        }
      }

      // Normal Login Flow continues (App.tsx will see session)
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login.');
      // Force logout if we were half-logged in but needed to stop
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call our Request Password Function
      const { data, error: fnError } = await supabase.functions.invoke('reset-password', {
        body: { email: forgotEmail, action: 'FORGOT_PASSWORD' }
      });

      if (fnError) throw new Error(fnError.message || 'Erro de conexão.');

      // We always show success for security
      alert('RECUPERAÇÃO DE SENHA\n\nSe o e-mail estiver cadastrado, você receberá uma senha temporária em instantes.');
      setView('LOGIN');
      setForgotEmail('');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitação.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePassword(newPassword)) {
      setError('A senha deve ter pelo menos 8 dígitos, uma letra maiúscula, um número e um caractere especial.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      // 1. Update Password in Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      // 2. Update Profile to remove first_access flag
      if (tempUser?.id) {
        await supabase
          .from('profiles')
          .update({ is_first_access: false })
          .eq('id', tempUser?.id);
      }

      // Success - App.tsx auth listener will pick up the session or user can re-login
      alert('Senha atualizada com sucesso! Você já pode acessar o sistema.');
      window.location.reload(); // Reload to ensure clean state and session pick-up

    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar senha.');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'FIRST_ACCESS') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark p-6">
        <div className="w-full max-w-md bg-surface-dark border border-surface-highlight rounded-3xl p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight">Definir Nova Senha</h2>
            <p className="text-text-secondary text-sm mt-2 font-medium">Olá, {tempUser?.nome}. Para continuar, crie uma senha segura de acesso.</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Nova Senha</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  autoFocus
                  disabled={loading}
                  className="w-full h-12 bg-background-dark border border-surface-highlight rounded-xl pl-4 pr-12 text-white focus:ring-2 focus:ring-primary font-bold transition-all disabled:opacity-50"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors flex items-center"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showNewPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Confirmar Senha</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  className="w-full h-12 bg-background-dark border border-surface-highlight rounded-xl pl-4 pr-12 text-white focus:ring-2 focus:ring-primary font-bold transition-all disabled:opacity-50"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors flex items-center"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
              <p className="text-[9px] text-primary font-black uppercase tracking-widest leading-relaxed">
                Requisitos: Mínimo 8 dígitos, 1 letra maiúscula, 1 número e 1 caractere especial (!@#$%).
              </p>
            </div>

            {error && <p className="text-xs text-danger font-bold text-center leading-relaxed">{error}</p>}

            <button
              disabled={loading}
              className="w-full h-14 bg-primary text-background-dark font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'PROCESSANDO...' : 'SALVAR E ACESSAR'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'FORGOT') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark p-6">
        <div className="w-full max-w-md bg-surface-dark border border-surface-highlight rounded-3xl p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight">Recuperar Senha</h2>
            <p className="text-text-secondary text-sm mt-2 font-medium">Insira seu e-mail para receber as instruções de recuperação.</p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">E-mail Cadastrado</label>
              <input
                type="email"
                required
                autoFocus
                autoComplete="off"
                disabled={loading}
                className="w-full h-14 bg-background-dark border border-surface-highlight rounded-2xl px-5 text-white focus:ring-2 focus:ring-primary font-bold transition-all disabled:opacity-50"
                placeholder="ex: voce@empresa.com.br"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </div>

            {error && <p className="text-xs text-danger font-bold text-center">{error}</p>}

            <button
              disabled={loading}
              className="w-full h-14 bg-primary text-background-dark font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'ENVIANDO...' : 'ENVIAR RECUPERAÇÃO'}
            </button>

            <button
              type="button"
              onClick={() => { setView('LOGIN'); setError(''); }}
              className="w-full text-center text-text-secondary text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
            >
              Voltar para o Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark p-6">
      <div className="w-full max-w-md bg-surface-dark border border-surface-highlight rounded-3xl p-10 shadow-2xl animate-in fade-in duration-500">
        <div className="flex justify-center mb-10">
          <div className="size-20 overflow-hidden rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <img src="/logo.png" alt="FinTek Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl font-black text-white tracking-tight">Gestão Financeira</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">E-mail</label>
            <input
              type="email"
              required
              autoComplete="off"
              disabled={loading}
              className="w-full h-14 bg-background-dark border border-surface-highlight rounded-2xl px-5 text-white focus:ring-2 focus:ring-primary font-bold transition-all disabled:opacity-50"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                disabled={loading}
                className="w-full h-14 bg-background-dark border border-surface-highlight rounded-2xl pl-5 pr-14 text-white focus:ring-2 focus:ring-primary font-bold transition-all disabled:opacity-50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors flex items-center"
              >
                <span className="material-symbols-outlined text-2xl">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => { setView('FORGOT'); setError(''); }}
              className="text-[10px] font-black text-text-secondary hover:text-primary uppercase tracking-widest transition-colors"
            >
              Esqueceu sua senha?
            </button>
          </div>

          {error && <p className="text-xs text-danger font-bold text-center">{error}</p>}

          <button
            disabled={loading}
            className="w-full h-14 bg-primary text-background-dark font-black rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'ACESSANDO...' : 'ENTRAR NO SISTEMA'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-surface-highlight/50 text-center">
          <p className="text-text-secondary text-[10px] font-black uppercase tracking-widest">FinTek &copy; 2023 - Sintek Tecnologia</p>
        </div>
      </div>

      {/* Version Tag at Bottom-Left */}
      <div className="absolute bottom-4 left-6 pointer-events-none">
        <p className="text-text-secondary/40 text-[9px] font-black uppercase tracking-[0.2em]">v1.2.5 - REFINADO</p>
      </div>
    </div>
  );
};

export default Login;
