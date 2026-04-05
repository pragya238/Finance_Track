import React from 'react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activePage, onNavigate }) => {
  const { user, logout } = useAuth();

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '??';

  const navItems = [
    { id: 'dashboard',    label: 'Dashboard',    section: 'Overview',   roles: ['viewer','analyst','admin'] },
    { id: 'transactions', label: 'Transactions', section: null,         roles: ['viewer','analyst','admin'] },
    { id: 'insights',     label: 'Insights',     section: 'Analytics',  roles: ['analyst','admin'] },
    { id: 'users',        label: 'Users',        section: 'Admin',      roles: ['admin'] },
  ];

  const visible = navItems.filter(i => i.roles.includes(user?.role));
  let lastSection = null;

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">💰</div>
        <span>FinanceTracker</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {visible.map((item) => {
          const showSection = item.section && item.section !== lastSection;
          if (showSection) lastSection = item.section;
          return (
            <React.Fragment key={item.id}>
              {showSection && <div className="nav-section">{item.section}</div>}
              <button
                className={`nav-link ${activePage === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <span>{item.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role-text">{user?.role}</div>
          </div>
        </div>
        <button className="btn btn-outline btn-sm" style={{ width: '100%' }} onClick={logout}>
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
