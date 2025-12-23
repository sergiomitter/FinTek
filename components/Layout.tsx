
import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { User } from '../types';

interface SidebarItemProps {
  to: string;
  icon: string;
  label: string;
  isActive: boolean;
  isAdminOnly?: boolean;
  userRole?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, isActive, isAdminOnly, userRole }) => {
  if (isAdminOnly && userRole !== 'ADMIN') return null;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
        ? 'bg-primary/10 border border-primary/20 text-slate-900 dark:text-white shadow-lg'
        : 'text-slate-600 dark:text-text-secondary hover:bg-slate-100 dark:hover:bg-surface-highlight hover:text-slate-900 dark:hover:text-white'
        }`}
    >
      <span className={`material-symbols-outlined ${isActive ? 'text-primary' : 'text-slate-400 dark:text-text-secondary'}`}>
        {icon}
      </span>
      <span className="text-sm font-bold">{label}</span>
    </Link>
  );
};

const Layout: React.FC<{ children: React.ReactNode, user: User, onLogout: () => void }> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const isActive = (path: string) => location.pathname === path;

  const todayTasks = [
    { id: 1, type: 'PAGAR', title: 'AWS Cloud Services', amount: 'R$ 450,00' },
    { id: 2, type: 'RECEBER', title: 'Consultoria Alpha', amount: 'R$ 12.000,00' },
    { id: 3, type: 'PAGAR', title: 'Aluguel Escritório', amount: 'R$ 3.200,00' },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display transition-colors duration-300">
      <aside className="hidden lg:flex flex-col w-72 h-full bg-white dark:bg-background-dark border-r border-slate-200 dark:border-surface-highlight shrink-0">
        <div className="flex flex-col h-full p-4">
          <div className="flex gap-3 items-center px-2 py-4 mb-6">
            <div className="size-10 overflow-hidden rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <img src="/logo.png" alt="FinTek Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-slate-900 dark:text-white text-lg font-black leading-tight tracking-tight">FinTek</h1>
              <p className="text-primary font-bold text-[10px] uppercase tracking-wider">Gestão Financeira</p>
            </div>
          </div>

          <div className="flex flex-col gap-1 flex-1 overflow-y-auto pr-2 scrollbar-hide">
            <SidebarItem to="/" icon="dashboard" label="Visão Geral" isActive={isActive('/')} />
            <SidebarItem to="/agendamentos" icon="event_note" label="Agendamentos" isActive={isActive('/agendamentos')} />

            <div className="px-4 py-3 mt-4">
              <p className="text-[10px] font-black text-slate-400 dark:text-text-secondary uppercase tracking-[0.2em]">Operacional</p>
            </div>
            <SidebarItem to="/pagar" icon="payments" label="A Pagar" isActive={isActive('/pagar')} />
            <SidebarItem to="/receber" icon="account_balance_wallet" label="A Receber" isActive={isActive('/receber')} />
            <SidebarItem to="/investimentos" icon="trending_up" label="Investimentos" isActive={isActive('/investimentos')} />

            <div className="px-4 py-3 mt-4">
              <p className="text-[10px] font-black text-slate-400 dark:text-text-secondary uppercase tracking-[0.2em]">Configurações</p>
            </div>
            <SidebarItem to="/cadastros/empresa" icon="domain" label="Empresas" isActive={isActive('/cadastros/empresa')} />
            <SidebarItem to="/cadastros/cliente" icon="group" label="Clientes" isActive={isActive('/cadastros/cliente')} />
            <SidebarItem to="/cadastros/pessoa" icon="person" label="Pessoas" isActive={isActive('/cadastros/pessoa')} />
            <SidebarItem to="/cadastros/banco" icon="account_balance" label="Bancos" isActive={isActive('/cadastros/banco')} />
            <SidebarItem to="/cadastros/fornecedor" icon="local_shipping" label="Fornecedores" isActive={isActive('/cadastros/fornecedor')} />

            {user.role === 'ADMIN' && (
              <SidebarItem
                to="/cadastros/usuarios"
                icon="admin_panel_settings"
                label="Usuários"
                isActive={isActive('/cadastros/usuarios')}
                isAdminOnly
                userRole={user.role}
              />
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-slate-200 dark:border-surface-highlight">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${user.nome}&background=3b82f6&color=0f172a&bold=true`}
                  alt="Profile"
                  className="size-10 rounded-full border border-slate-200 dark:border-surface-highlight"
                />
                <div className="overflow-hidden">
                  <p className="text-slate-900 dark:text-white text-sm font-black truncate">{user.nome}</p>
                  <p className="text-slate-500 dark:text-text-secondary text-[10px] font-bold uppercase truncate">{user.role}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-danger transition-colors"
                title="Sair do sistema"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-surface-highlight bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-20">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-slate-900 dark:text-white material-symbols-outlined"
          >
            menu
          </button>
          <div className="hidden lg:flex items-center gap-4">
            <h2 className="text-slate-900 dark:text-white text-xl font-black tracking-tight">
              {isActive('/') ? 'Visão Geral' : isActive('/agendamentos') ? 'Agendamentos' : 'Financeiro'}
            </h2>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end relative">
            <div className="hidden md:flex relative group max-w-xs w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-text-secondary text-xl">search</span>
              <input
                className="w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-surface-highlight rounded-lg bg-slate-50 dark:bg-surface-dark text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                placeholder="Buscar lançamentos..."
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-white dark:border-background-dark"></span>
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                  <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-highlight rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 bg-slate-50 dark:bg-surface-highlight/20 border-b border-slate-200 dark:border-surface-highlight">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-text-secondary">Lançamentos de Hoje</p>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {todayTasks.map(task => (
                        <div key={task.id} className="p-4 border-b border-slate-100 dark:border-surface-highlight/30 hover:bg-slate-50 dark:hover:bg-surface-highlight/10 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className={`text-[9px] font-black uppercase ${task.type === 'PAGAR' ? 'text-danger' : 'text-primary'}`}>
                                {task.type === 'PAGAR' ? 'A Pagar' : 'A Receber'}
                              </span>
                              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{task.title}</p>
                            </div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{task.amount}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 text-center border-t border-slate-100 dark:border-surface-highlight">
                      <Link
                        to="/agendamentos"
                        onClick={() => setShowNotifications(false)}
                        className="text-xs font-black text-primary hover:text-primary-hover uppercase tracking-wider"
                      >
                        Ver agenda completa
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-500 dark:text-text-secondary hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth bg-background-light dark:bg-background-dark p-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;