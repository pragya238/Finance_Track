import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import DashboardPage    from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import InsightsPage     from './pages/InsightsPage';
import UsersPage        from './pages/UsersPage';
import Sidebar          from './components/Sidebar';
import './index.css';

const AppContent = () => {
  const { user } = useAuth();
  const [authView, setAuthView]     = useState('login');
  const [activePage, setActivePage] = useState('dashboard');

  if (!user) {
    return authView === 'login'
      ? <LoginPage    onSwitch={() => setAuthView('register')} />
      : <RegisterPage onSwitch={() => setAuthView('login')} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':    return <DashboardPage />;
      case 'transactions': return <TransactionsPage />;
      case 'insights':
        return ['analyst','admin'].includes(user.role)
          ? <InsightsPage />
          : <div className="alert alert-error" style={{margin:20}}>Access denied.</div>;
      case 'users':
        return user.role === 'admin'
          ? <UsersPage />
          : <div className="alert alert-error" style={{margin:20}}>Access denied.</div>;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
};

const App = () => (
  <AuthProvider><AppContent /></AuthProvider>
);

export default App;
