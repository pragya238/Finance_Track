import React, { useCallback, useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AddTransactionModal from '../components/AddTransactionModal';

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const WidgetPage = ({ onOpenApp, theme, onToggleTheme }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      const response = await dashboardAPI.getSummary();
      setData(response.data?.data || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
    const captureInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener('beforeinstallprompt', captureInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', captureInstallPrompt);
  }, [loadSummary]);

  const summary = data?.summary || {};
  const income = Number(summary.totalIncome || 0);
  const expenses = Number(summary.totalExpenses || 0);
  const balance = Number(summary.netBalance || 0);
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
  const firstName = user?.name?.split(' ')[0] || 'there';

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  const styles = {
    shell: {
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: '24px 16px',
      background: theme === 'dark' ? '#201c29' : '#fff8f7',
      color: theme === 'dark' ? '#f8f0f7' : '#3e3845'
    },
    card: {
      width: 'min(100%, 420px)',
      padding: 22,
      borderRadius: 28,
      background: theme === 'dark' ? '#2c2536' : '#fffdfc',
      border: '1px solid ' + (theme === 'dark' ? '#493d52' : '#eadfe6'),
      boxShadow: theme === 'dark' ? '0 18px 44px rgba(0,0,0,.3)' : '0 18px 44px rgba(92,67,98,.14)'
    },
    eyebrow: { color: theme === 'dark' ? '#e0c7ff' : '#7650a8', fontSize: 10, fontWeight: 800, letterSpacing: '.13em', textTransform: 'uppercase' },
    muted: { color: theme === 'dark' ? '#b0a2b3' : '#8c8290' },
    action: { border: 0, borderRadius: 12, padding: '11px 14px', background: '#a27bd0', color: '#fff', fontWeight: 800, cursor: 'pointer' },
    secondary: { border: '1px solid ' + (theme === 'dark' ? '#62536d' : '#d5c6d3'), borderRadius: 12, padding: '10px 13px', background: 'transparent', color: 'inherit', fontWeight: 750, cursor: 'pointer' }
  };

  return (
    <main style={styles.shell}>
      <section style={styles.card} aria-label="Finance Tracker quick glance">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 12, background: '#a27bd0', color: '#fff', fontWeight: 900 }}>₹</div>
            <div>
              <strong style={{ display: 'block', fontSize: 14 }}>Finance Tracker</strong>
              <span style={{ ...styles.muted, fontSize: 11 }}>quick glance</span>
            </div>
          </div>
          <button onClick={onToggleTheme} style={{ ...styles.secondary, padding: '8px 10px', fontSize: 12 }} aria-label="Toggle theme">{theme === 'dark' ? '☀' : '◐'}</button>
        </div>

        <div style={{ marginTop: 26 }}>
          <div style={styles.eyebrow}>YOUR MONEY / TODAY</div>
          <h1 style={{ margin: '6px 0 4px', fontSize: 28, letterSpacing: '-.06em' }}>Hi, {firstName} ✦</h1>
          <p style={{ ...styles.muted, margin: 0, fontSize: 13 }}>A small check-in before you get on with your day.</p>
        </div>

        {loading ? (
          <div style={{ ...styles.muted, marginTop: 28 }}>Loading your numbers…</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 10, marginTop: 24 }}>
            <div style={{ gridRow: 'span 2', padding: 16, borderRadius: 19, background: theme === 'dark' ? '#38584d' : '#dff5eb' }}>
              <span style={{ ...styles.muted, fontSize: 11 }}>Available balance</span>
              <strong style={{ display: 'block', marginTop: 13, fontSize: 29, letterSpacing: '-.06em' }}>{fmt(balance)}</strong>
              <span style={{ ...styles.muted, display: 'block', marginTop: 8, fontSize: 11 }}>Income minus expenses</span>
            </div>
            <div style={{ padding: 14, borderRadius: 17, background: theme === 'dark' ? '#4a3c24' : '#fff5d9' }}>
              <span style={{ ...styles.muted, fontSize: 11 }}>Income</span>
              <strong style={{ display: 'block', marginTop: 7, fontSize: 20 }}>{fmt(income)}</strong>
            </div>
            <div style={{ padding: 14, borderRadius: 17, background: theme === 'dark' ? '#512e32' : '#ffebe6' }}>
              <span style={{ ...styles.muted, fontSize: 11 }}>Expenses</span>
              <strong style={{ display: 'block', marginTop: 7, fontSize: 20 }}>{fmt(expenses)}</strong>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 17, padding: '12px 14px', borderRadius: 15, background: theme === 'dark' ? '#352d40' : '#f4edf9' }}>
          <span style={{ ...styles.muted, fontSize: 12 }}>Savings rate</span>
          <strong style={{ color: theme === 'dark' ? '#e0c7ff' : '#7650a8' }}>{savingsRate}%</strong>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: installPrompt ? '1fr 1fr' : '1fr', gap: 9, marginTop: 19 }}>
          {installPrompt && <button onClick={install} style={styles.action}>Add to home screen</button>}
          <button onClick={onOpenApp} style={installPrompt ? styles.secondary : styles.action}>Open full app <span aria-hidden="true">→</span></button>
        </div>

        <p style={{ ...styles.muted, margin: '18px 0 0', fontSize: 11, lineHeight: 1.55 }}>
          Install this compact view from your browser menu to keep Finance Tracker one tap away on your phone or laptop.
        </p>

        {['analyst', 'admin'].includes(user?.role) && (
          <button onClick={() => setShowModal(true)} style={{ ...styles.secondary, width: '100%', marginTop: 12 }}>＋ Add transaction</button>
        )}
      </section>
      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} onAdded={loadSummary} />}
    </main>
  );
};

export default WidgetPage;
