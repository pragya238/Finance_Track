import React, { useEffect, useState, useCallback } from 'react';
import { transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AddTransactionModal from '../components/AddTransactionModal';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const CATEGORIES = {
  income: ['salary', 'freelance', 'investment', 'gift', 'other_income'],
  expense: ['food', 'transport', 'housing', 'utilities', 'healthcare', 'entertainment', 'shopping', 'education', 'travel', 'other_expense'],
};

const label = (value) => value.replace(/_/g, ' ');

const TransactionsPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '' });

  const canCreate = ['analyst', 'admin'].includes(user?.role);
  const canDelete = user?.role === 'admin';

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
      const res = await transactionAPI.getAll(params);
      setTransactions(res.data?.data?.transactions || []);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await transactionAPI.delete(id);
      fetchTransactions();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const visibleCategories = filters.type ? CATEGORIES[filters.type] : [...new Set([...CATEGORIES.income, ...CATEGORIES.expense])];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Transactions</h1>
          <p>{transactions.length} records · newest first</p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowModal(true)}>
            + Add transaction
          </button>
        )}
      </div>

      <div className="filters">
        <select aria-label="Filter by type" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value, category: '' })}>
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select aria-label="Filter by category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All categories</option>
          {visibleCategories.map((category) => <option key={category} value={category}>{label(category)}</option>)}
        </select>
        <input aria-label="Start date" type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
        <input aria-label="End date" type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
        <button className="btn btn-outline btn-sm" onClick={() => setFilters({ type: '', category: '', startDate: '', endDate: '' })}>Clear</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading-screen"><span className="spinner"></span> Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <div className="icon">💳</div>
              No transactions match these filters
              {canCreate && <p>Click “+ Add transaction” to add your first record.</p>}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th><th>Description</th><th>Category</th><th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  {canDelete && <th aria-label="Actions"></th>}
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(transaction.date).toLocaleDateString('en-IN')}</td>
                    <td style={{ fontWeight: 500 }}>{transaction.description || '—'}</td>
                    <td style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>{label(transaction.category)}</td>
                    <td><span className={`badge badge-${transaction.type}`}>{transaction.type}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={transaction.type === 'income' ? 'amt-pos' : 'amt-neg'}>
                        {transaction.type === 'income' ? '+' : '−'}{fmt(transaction.amount)}
                      </span>
                    </td>
                    {canDelete && <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(transaction._id)}>Delete</button></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} onAdded={fetchTransactions} />}
    </div>
  );
};

export default TransactionsPage;
