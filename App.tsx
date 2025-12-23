
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import Schedule from './screens/Schedule';
import Payable from './screens/Payable';
import Receivable from './screens/Receivable';
import Investments from './screens/Investments';
import CompanyReg from './screens/Cadastros/CompanyReg';
import PeopleReg from './screens/Cadastros/PeopleReg';
import BankReg from './screens/Cadastros/BankReg';
import SupplierReg from './screens/Cadastros/SupplierReg';
import CustomerReg from './screens/Cadastros/CustomerReg';
import UserReg from './screens/Cadastros/UserReg';
import { User, UserRole } from './types';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          nome: session.user.user_metadata?.nome || session.user.email?.split('@')[0] || 'Usuário',
          email: session.user.email || '',
          celular: session.user.user_metadata?.celular || '',
          funcao: session.user.user_metadata?.funcao || '',
          role: (session.user.user_metadata?.role as UserRole) || 'USER',
          isFirstAccess: session.user.user_metadata?.isFirstAccess || false
        };
        setCurrentUser(user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          nome: session.user.user_metadata?.nome || session.user.email?.split('@')[0] || 'Usuário',
          email: session.user.email || '',
          celular: session.user.user_metadata?.celular || '',
          funcao: session.user.user_metadata?.funcao || '',
          role: (session.user.user_metadata?.role as UserRole) || 'USER',
          isFirstAccess: session.user.user_metadata?.isFirstAccess || false
        };
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return null;

  if (!currentUser) {
    return <Login />;
  }

  return (
    <Router>
      <Layout user={currentUser} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard user={currentUser} />} />
          <Route path="/agendamentos" element={<Schedule user={currentUser} />} />
          <Route path="/pagar" element={<Payable user={currentUser} />} />
          <Route path="/receber" element={<Receivable user={currentUser} />} />
          <Route path="/investimentos" element={<Investments user={currentUser} />} />
          <Route path="/cadastros/empresa" element={<CompanyReg user={currentUser} />} />
          <Route path="/cadastros/pessoa" element={<PeopleReg user={currentUser} />} />
          <Route path="/cadastros/banco" element={<BankReg user={currentUser} />} />
          <Route path="/cadastros/fornecedor" element={<SupplierReg user={currentUser} />} />
          <Route path="/cadastros/cliente" element={<CustomerReg user={currentUser} />} />

          {currentUser.role === 'ADMIN' && (
            <Route path="/cadastros/usuarios" element={<UserReg />} />
          )}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
