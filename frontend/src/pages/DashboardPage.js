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
  const totalCategorySpend = expenseCategories.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const maxFlow = Math.max(income, expenses, 1);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';
  const hasData = income > 0 || expenses > 0 || recentTransactions.length > 0;
  const canCreate = ['analyst', 'admin'].includes(user?.role);

  return (
    <div className="dashboard-page">
      <header className="page-header dashboard-header">
        <div className="page-header-left">
          <span className="page-kicker">MY MONEY / {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
          <h1>{greeting}, {firstName} <span className="wave">✦</span></h1>
          <p>Here is your financial picture for this month.</p>
        </div>
        <div className="header-actions">
          <button className="month-select" type="button"><span>◷</span> This month <b>⌄</b></button>
          {canCreate && <button className="btn btn-primary dashboard-add-btn" onClick={() => setShowModal(true)}><span>＋</span> Add transaction</button>}
        </div>
      </header>

      <section className="welcome-card">
        <div className="welcome-copy">
          <span className="welcome-eyebrow">A LITTLE CHECK-IN</span>
          <h2>Small steps add up.</h2>
          <p>{hasData ? 'You have started building a clear picture of your spending. Keep it going.' : 'Add one transaction to start seeing useful patterns in your money.'}</p>
          {canCreate && <button className="welcome-link" onClick={() => setShowModal(true)}>{hasData ? 'Add another transaction' : 'Add your first transaction'} <span>→</span></button>}
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="art-sun"></div>
          <div className="art-card art-card-back"></div>
          <div className="art-card art-card-front"><span>₹</span><strong>{fmt(balance)}</strong><small>balance</small></div>
          <div className="art-star star-one">✦</div>
          <div className="art-star star-two">·</div>
        </div>
      </section>

      <section className="stats-grid" aria-label="Financial summary">
        <article className="stat-card stat-card-balance">
          <div className="stat-card-top"><span className="stat-icon">◒</span><span className="stat-label">Balance</span><span className="stat-menu">•••</span></div>
          <div className="stat-value">{fmt(balance)}</div>
          <div className="stat-caption">Income minus expenses</div>
        </article>
        <article className="stat-card stat-card-income">
          <div className="stat-card-top"><span className="stat-icon">↗</span><span className="stat-label">Income</span><span className="stat-menu">•••</span></div>
          <div className="stat-value">{fmt(income)}</div>
          <div className="stat-caption">Money in this month</div>
        </article>
        <article className="stat-card stat-card-expense">
          <div className="stat-card-top"><span className="stat-icon">↘</span><span className="stat-label">Expenses</span><span className="stat-menu">•••</span></div>
          <div className="stat-value">{fmt(expenses)}</div>
          <div className="stat-caption">Money out this month</div>
        </article>
        <article className="stat-card stat-card-savings">
          <div className="stat-card-top"><span className="stat-icon">✦</span><span className="stat-label">Savings rate</span><span className="stat-menu">•••</span></div>
          <div className="stat-value">{savingsRate}%</div>
          <div className="stat-caption">{savingsRate >= 0 ? 'Room to build a cushion' : 'Expenses are ahead'}</div>
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid-main">
        <article className="card flow-card">
          <div className="card-header">
            <div><span className="card-kicker">THIS MONTH</span><h2>Cash flow</h2></div>
            <span className="card-header-note">Income vs expenses</span>
          </div>
          <div className="card-body">
            <div className="flow-total"><strong>{fmt(balance)}</strong><span>net movement</span></div>
            <div className="flow-meters">
              <div className="flow-meter">
                <div className="flow-meter-label"><span><i className="meter-dot meter-income"></i>Income</span><strong>{fmt(income)}</strong></div>
                <div className="flow-track"><div className="flow-fill flow-fill-income" style={{ width: (income / maxFlow * 100) + '%' }}></div></div>
              </div>
              <div className="flow-meter">
                <div className="flow-meter-label"><span><i className="meter-dot meter-expense"></i>Expenses</span><strong>{fmt(expenses)}</strong></div>
                <div className="flow-track"><div className="flow-fill flow-fill-expense" style={{ width: (expenses / maxFlow * 100) + '%' }}></div></div>
              </div>
            </div>
            <div className={'flow-note ' + (hasData ? 'has-data' : '')}><span>✦</span>{hasData ? 'Your totals update every time you add a transaction.' : 'Add a transaction to start your first month.'}</div>
          </div>
        </article>

        <article className="card category-card">
          <div className="card-header">
            <div><span className="card-kicker">SPENDING</span><h2>By category</h2></div>
            <span className="card-header-note">{expenseCategories.length ? expenseCategories.length + ' categories' : 'Waiting for data'}</span>
          </div>
          <div className="card-body category-body">
            {expenseCategories.length === 0 ? (
              <div className="category-empty">
                <div className="empty-donut"><div>₹</div></div>
                <strong>Nothing to sort yet</strong>
                <p>Your spending categories will show up here.</p>
                {canCreate && <button className="text-button" onClick={() => setShowModal(true)}>Add an expense <span>→</span></button>}
              </div>
            ) : (
              <>
                <div className="category-total"><strong>{fmt(totalCategorySpend)}</strong><span>total expenses</span></div>
                {expenseCategories.map((item, index) => {
                  const amount = Number(item.total || 0);
                  const percent = totalCategorySpend ? Math.round((amount / totalCategorySpend) * 100) : 0;
                  return (
                    <div className="category-row" key={item.category}>
                      <div className="category-row-top"><span className="category-name"><i className={'category-dot dot-' + index}></i>{label(item.category)}</span><strong>{fmt(amount)}</strong></div>
                      <div className="category-track"><div className={'category-fill fill-' + index} style={{ width: percent + '%' }}></div></div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid-secondary">
        <article className="card recent-card">
          <div className="card-header">
            <div><span className="card-kicker">ACTIVITY</span><h2>Recent transactions</h2></div>
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
          <div className="card-header"><div><span className="card-kicker">A QUICK LOOK</span><h2>Your money pulse</h2></div><span className="signal-badge">MONTHLY</span></div>
          <div className="pulse-content">
            <div className="pulse-score"><span>{savingsRate >= 0 ? '↗' : '↘'}</span><strong>{savingsRate}%</strong><small>savings rate</small></div>
            <div className="pulse-copy">
              <strong>{savingsRate >= 20 ? 'You are building a cushion.' : savingsRate >= 0 ? 'There is room to build a cushion.' : 'Expenses are ahead of income.'}</strong>
              <p>{hasData ? 'Keep tracking consistently and this will become more useful over time.' : 'Add income and expenses to see a personal signal here.'}</p>
            </div>
          </div>
          <div className="pulse-tip"><span>✦</span> Add short notes so your history is easier to scan later.</div>
        </article>
      </section>

      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} onAdded={loadDashboard} />}
    </div>
  );
};

export default DashboardPage;
