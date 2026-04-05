import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

const BAR_COLORS = ['#E24B4A','#7F77DD','#378ADD','#1D9E75','#EF9F27','#B4B2A9'];

const DashboardPage = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    dashboardAPI.getSummary()
      .then(res => setData(res.data.data))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><span className="spinner"></span> Loading dashboard...</div>;
  if (error)   return <div className="alert alert-error">{error}</div>;

  const { summary, categoryTotals, recentTransactions } = data;
  const expenseCategories = categoryTotals.filter(c => c.type === 'expense');
  const maxCat = Math.max(...expenseCategories.map(c => c.total), 1);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dashboard</h1>
          <p>Your financial overview · {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total income</div>
          <div className="value income">{fmt(summary.totalIncome)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total expenses</div>
          <div className="value expense">{fmt(summary.totalExpenses)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Net balance</div>
          <div className={`value ${summary.netBalance >= 0 ? 'balance' : 'expense'}`}>
            {fmt(summary.netBalance)}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header"><h2>Recent transactions</h2></div>
          {recentTransactions.length === 0 ? (
            <div className="empty-state"><div className="icon">💳</div><p>No transactions yet</p></div>
          ) : (
            recentTransactions.map((t) => (
              <div key={t._id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderBottom:'0.5px solid var(--border)' }}>
                <div style={{ width:30, height:30, borderRadius:8, background: t.type==='income' ? 'var(--primary-light)' : 'var(--danger-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>
                  {t.type === 'income' ? '💰' : '💸'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:500 }}>{t.description || t.category.replace('_',' ')}</div>
                  <div style={{ fontSize:11, color:'var(--text-hint)' }}>{new Date(t.date).toLocaleDateString('en-IN')}</div>
                </div>
                <span className={t.type === 'income' ? 'amt-pos' : 'amt-neg'} style={{ fontSize:13 }}>
                  {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <div className="card-header"><h2>Spending by category</h2></div>
          {expenseCategories.length === 0 ? (
            <div className="empty-state"><div className="icon">📊</div><p>No expense data yet</p></div>
          ) : (
            expenseCategories.slice(0,6).map((c, i) => (
              <div className="cat-bar-item" key={i}>
                <span className="cat-bar-label">{c.category.replace('_',' ')}</span>
                <div className="cat-bar-track">
                  <div className="cat-bar-fill" style={{ width: `${(c.total / maxCat) * 100}%`, background: BAR_COLORS[i % BAR_COLORS.length] }}></div>
                </div>
                <span className="cat-bar-val">{fmt(c.total)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
