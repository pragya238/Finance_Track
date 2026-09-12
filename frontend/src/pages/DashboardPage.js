import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AddTransactionModal from '../components/AddTransactionModal';

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const label = (value) => String(value || '').replace(/_/g, ' ');

const DashboardPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.getSummary();
      setData(res.data?.data || null);
      setError('');
    } catch {
      setError('We could not load your dashboard right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const summary = data?.summary || {};
  const recentTransactions = data?.recentTransactions || [];
  const expenseCategories = useMemo(
    () => (data?.categoryTotals || [])
      .filter(item => item.type === 'expense')
      .sort((a, b) => Number(b.total) - Number(a.total))
      .slice(0, 5),
    [data]
  );

  if (loading) return <div className="loading-screen"><span className="spinner"></span> Loading your overview...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  const income = Number(summary.totalIncome || 0);
  const expenses = Number(summary.totalExpenses || 0);
  const balance = Number(summary.netBalance || 0);
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
  const maxFlow = Math.max(income, expenses, 1);
  const totalCategorySpend = expenseCategories.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';
  const hasData = income > 0 || expenses > 0 || recentTransactions.length > 0;

  return (
    <div className="dashboard-page">
      <header className="page-header dashboard-header">
        <div className="page-header-left">
          <div className="eyebrow">PERSONAL FINANCE / {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }).toUpperCase()}</div>
          <h1>{greeting}, {firstName}.</h1>
          <p>A calmer view of where your money is going.</p>
        </div>
        <div className="header-actions">
          <div className="period-chip"><span className="status-dot"></span> This month</div>
          {['analyst', 'admin'].includes(user?.role) && (
            <button className="btn btn-primary dashboard-add-btn" onClick={() => setShowModal(true)}>
              <span>＋</span> Add transaction
            </button>
          )}
        </div>
      </header>

      {!hasData && (
        <div className="welcome-banner">
          <div className="welcome-icon">✦</div>
          <div>
            <strong>Your financial workspace is ready.</strong>
            <p>Add your first transaction to unlock trends, category breakdowns, and savings signals.</p>
          </div>
          {['analyst', 'admin'].includes(user?.role) && (
            <button className="btn btn-secondary" onClick={() => setShowModal(true)}>Add first transaction</button>
          )}
        </div>
      )}

      <section className="stats-grid stats-grid-enhanced" aria-label="Financial summary">
        <article className="stat-card stat-card-featured">
          <div className="stat-card-top"><span className="stat-icon">◒</span><span className="stat-kicker">Available balance</span></div>
          <div className={'stat-value ' + (balance >= 0 ? 'balance' : 'expense')}>{fmt(balance)}</div>
          <div className="stat-meta"><span className="stat-meta-dot"></span> Income minus expenses</div>
        </article>
        <article className="stat-card">
          <div className="stat-card-top"><span className="stat-icon income-icon">↗</span><span className="stat-kicker">Total income</span></div>
          <div className="stat-value income">{fmt(income)}</div>
          <div className="stat-meta positive">Money in this month</div>
        </article>
        <article className="stat-card">
          <div className="stat-card-top"><span className="stat-icon expense-icon">↘</span><span className="stat-kicker">Total expenses</span></div>
          <div className="stat-value expense">{fmt(expenses)}</div>
          <div className="stat-meta">Money out this month</div>
        </article>
        <article className="stat-card">
          <div className="stat-card-top"><span className="stat-icon savings-icon">✦</span><span className="stat-kicker">Savings rate</span></div>
          <div className="stat-value">{savingsRate}%</div>
          <div className={'stat-meta ' + (savingsRate >= 0 ? 'positive' : 'negative')}>{savingsRate >= 0 ? 'Keep the momentum' : 'Review your outgoings'}</div>
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid-main">
        <article className="card flow-card">
          <div className="card-header">
            <div><div className="card-kicker">AT A GLANCE</div><h2>Cash flow snapshot</h2></div>
            <span className="card-header-note">This month</span>
          </div>
          <div className="card-body flow-body">
            <div className="flow-total"><strong>{fmt(balance)}</strong><span>net movement</span></div>
            <div className="flow-rows">
              <div className="flow-row">
                <div className="flow-label"><span className="flow-dot income-dot"></span><span>Income</span><strong>{fmt(income)}</strong></div>
                <div className="flow-track"><div className="flow-fill income-fill" style={{ width: (income / maxFlow * 100) + '%' }}></div></div>
              </div>
              <div className="flow-row">
                <div className="flow-label"><span className="flow-dot expense-dot"></span><span>Expenses</span><strong>{fmt(expenses)}</strong></div>
                <div className="flow-track"><div className="flow-fill expense-fill" style={{ width: (expenses / maxFlow * 100) + '%' }}></div></div>
              </div>
            </div>
            <div className="flow-footnote"><span className="pulse-line"></span>{hasData ? 'Your numbers update as you add transactions.' : 'Add a transaction to start your first snapshot.'}</div>
          </div>
        </article>

        <article className="card category-card">
          <div className="card-header">
            <div><div className="card-kicker">WHERE IT GOES</div><h2>Spending by category</h2></div>
            <span className="card-header-note">{expenseCategories.length ? expenseCategories.length + ' shown' : 'No data'}</span>
          </div>
          <div className="card-body category-body">
            {expenseCategories.length === 0 ? (
              <div className="empty-state compact-empty"><div className="empty-illustration">◌</div><p>Your category breakdown will appear here.</p></div>
            ) : (
              expenseCategories.map((item, index) => {
                const amount = Number(item.total || 0);
                const percent = totalCategorySpend ? Math.round((amount / totalCategorySpend) * 100) : 0;
                return (
                  <div className="category-row" key={item.category}>
                    <div className="category-row-top"><span className="category-name"><span className={'category-dot dot-' + index}></span>{label(item.category)}</span><strong>{fmt(amount)}</strong></div>
                    <div className="category-track"><div className={'category-fill fill-' + index} style={{ width: percent + '%' }}></div></div>
                  </div>
                );
              })
            )}
          </div>
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid-secondary">
        <article className="card recent-card">
          <div className="card-header">
            <div><div className="card-kicker">ACTIVITY</div><h2>Recent transactions</h2></div>
            <button className="text-button" onClick={() => onNavigate && onNavigate('transactions')}>View all <span>→</span></button>
          </div>
          <div className="recent-list">
            {recentTransactions.length === 0 ? (
              <div className="empty-state compact-empty"><div className="empty-illustration">＋</div><p>No transactions yet.</p><span>Add your first record to make this space useful.</span></div>
            ) : (
              recentTransactions.slice(0, 5).map((transaction) => (
                <div className="recent-row" key={transaction._id}>
                  <div className={'transaction-mark ' + (transaction.type === 'income' ? 'mark-income' : 'mark-expense')}>{transaction.type === 'income' ? '↗' : '↘'}</div>
                  <div className="recent-copy"><strong>{transaction.description || label(transaction.category)}</strong><span>{new Date(transaction.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {label(transaction.category)}</span></div>
                  <span className={transaction.type === 'income' ? 'amt-pos' : 'amt-neg'}>{transaction.type === 'income' ? '+' : '−'}{fmt(transaction.amount)}</span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="card pulse-card">
          <div className="card-header"><div><div className="card-kicker">YOUR MONEY PULSE</div><h2>One useful signal</h2></div><span className="signal-badge">LIVE</span></div>
          <div className="pulse-content">
            <div className="pulse-score"><span>{savingsRate >= 0 ? '↗' : '↘'}</span><strong>{savingsRate}%</strong><small>savings rate</small></div>
            <div className="pulse-copy">
              <strong>{savingsRate >= 20 ? 'You are building a cushion.' : savingsRate >= 0 ? 'There is room to build a cushion.' : 'Expenses are ahead of income.'}</strong>
              <p>{hasData ? 'Keep tracking consistently and this signal will become more precise.' : 'Add income and expense records to see a personal signal here.'}</p>
            </div>
          </div>
          <div className="pulse-tip"><span>✦</span> Tip: short, descriptive notes make your history easier to scan.</div>
        </article>
      </section>

      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} onAdded={loadDashboard} />}
    </div>
  );
};

export default DashboardPage;
