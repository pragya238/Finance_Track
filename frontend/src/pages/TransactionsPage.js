import React, { useEffect, useState, useCallback } from 'react';
import { transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AddTransactionModal from '../components/AddTransactionModal';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

const TransactionsPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [filters, setFilters]           = useState({ type:'', startDate:'', endDate:'' });

  const canCreate = ['analyst','admin'].includes(user?.role);
  const canDelete = user?.role === 'admin';

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v));
      const res = await transactionAPI.getAll(params);
      setTransactions(res.data.data.transactions);
    } catch { setTransactions([]); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try { await transactionAPI.delete(id); fetchTransactions(); }
    catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Transactions</h1>
          <p>{transactions.length} records</p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" style={{ width:'auto', background:'var(--primary)', color:'var(--primary-dark)' }} onClick={() => setShowModal(true)}>
            + Add transaction
          </button>
        )}
      </div>

      <div className="filters">
        <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
        <input type="date" value={filters.endDate}   onChange={e => setFilters({...filters, endDate: e.target.value})} />
        <button className="btn btn-outline btn-sm" onClick={() => setFilters({ type:'', startDate:'', endDate:'' })}>Clear</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading-screen"><span className="spinner"></span> Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <div className="icon">💳</div>
              No transactions found
              {canCreate && <p>Click "+ Add transaction" to get started</p>}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th style={{ textAlign:'right' }}>Amount</th>
                  {canDelete && <th></th>}
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t._id}>
                    <td style={{ color:'var(--text-muted)', whiteSpace:'nowrap' }}>{new Date(t.date).toLocaleDateString('en-IN')}</td>
                    <td style={{ fontWeight:500 }}>{t.description || '—'}</td>
                    <td style={{ textTransform:'capitalize', color:'var(--text-muted)' }}>{t.category.replace('_',' ')}</td>
                    <td><span className={`badge badge-${t.type}`}>{t.type}</span></td>
                    <td style={{ textAlign:'right' }}>
                      <span className={t.type === 'income' ? 'amt-pos' : 'amt-neg'}>
                        {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
                      </span>
                    </td>
                    {canDelete && (
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}>Delete</button>
                      </td>
                    )}
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
