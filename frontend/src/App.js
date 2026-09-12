import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import DashboardPage    from './pages/DashboardPage';
import WidgetPage       from './pages/WidgetPage';
import TransactionsPage from './pages/TransactionsPage';
import InsightsPage     from './pages/InsightsPage';
import UsersPage        from './pages/UsersPage';
import Sidebar          from './components/Sidebar';
import './index.css';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  try {
    return localStorage.getItem('finance-theme') || 'light';
  } catch {
    return 'light';
  }
};

const AppContent = () => {
  const { user, initializing, logout } = useAuth();
  const [authView, setAuthView] = useState('login');
  const [activePage, setActivePage] = useState('dashboard');
  const [theme, setTheme] = useState(getInitialTheme);
  const [widgetMode, setWidgetMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('view') === 'widget';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('finance-theme', theme);
    } catch {
      // Theme still works for this session when storage is unavailable.
    }
  }, [theme]);

  useEffect(() => {
    const onSessionExpired = () => logout();
    window.addEventListener('finance:session-expired', onSessionExpired);
    return () => window.removeEventListener('finance:session-expired', onSessionExpired);
  }, [logout]);

  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark');

  const openFullApp = () => {
    window.history.replaceState({}, '', '/');
    setWidgetMode(false);
    setActivePage('dashboard');
  };

  if (initializing) {
    return <div className="loading-screen"><span className="spinner"></span> Restoring your session...</div>;
  }

  if (!user) {
    return authView === 'login'
      ? <LoginPage onSwitch={() => setAuthView('register')} />
      : <RegisterPage onSwitch={() => setAuthView('login')} />;
  }

  if (widgetMode) {
    return <WidgetPage onOpenApp={openFullApp} theme={theme} onToggleTheme={toggleTheme} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage onNavigate={setActivePage} />;
      case 'transactions': return <TransactionsPage />;
      case 'insights':
        return ['analyst', 'admin'].includes(user.role)
          ? <InsightsPage />
          : <div className="alert alert-error" style={{ margin: 20 }}>Access denied.</div>;
      case 'users':
        return user.role === 'admin'
          ? <UsersPage />
          : <div className="alert alert-error" style={{ margin: 20 }}>Access denied.</div>;
      default: return <DashboardPage onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
};

const App = () => (
  <AuthProvider><AppContent /></AuthProvider>
);

export default App;
