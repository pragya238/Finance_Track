import React from 'react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activePage, onNavigate, theme, onToggleTheme }) => {
  const { user, logout } = useAuth();

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', section: 'Overview', icon: '⌂', roles: ['viewer', 'analyst', 'admin'] },
    { id: 'transactions', label: 'Transactions', section: null, icon: '↗', roles: ['viewer', 'analyst', 'admin'] },
    { id: 'insights', label: 'Insights', section: 'Analytics', icon: '✦', roles: ['analyst', 'admin'] },
    { id: 'users', label: 'Users', section: 'Admin', icon: '◎', roles: ['admin'] },
  ];

  const visible = navItems.filter(item => item.roles.includes(user?.role));
  let lastSection = null;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">₹</div>
        <div className="sidebar-brand">
          <span>FinanceTracker</span>
          <small>money, made clear</small>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {visible.map((item) => {
          const showSection = item.section && item.section !== lastSection;
          if (showSection) lastSection = item.section;
          return (
            <React.Fragment key={item.id}>
              {showSection && <div className="nav-section">{item.section}</div>}
              <button
                className={'nav-link ' + (activePage === item.id ? 'active' : '')}
                onClick={() => onNavigate(item.id)}
              >
                <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={onToggleTheme} aria-label={'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' theme'}>
          <span className="theme-toggle-icon">{theme === 'dark' ? '☀' : '◐'}</span>
          <span>{theme === 'dark' ? 'Light theme' : 'Dark theme'}</span>
          <span className="theme-toggle-key">T</span>
        </button>

        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role-text">{user?.role}</div>
          </div>
        </div>
        <button className="btn btn-outline btn-sm sign-out-btn" onClick={logout}>
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
