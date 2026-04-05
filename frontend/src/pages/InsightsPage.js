import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

const InsightsPage = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    dashboardAPI.getInsights()
      .then(res => setInsights(res.data.data))
      .catch(() => setError('Failed to load insights'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><span className="spinner"></span> Loading insights...</div>;
  if (error)   return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Insights</h1>
          <p>Top spending and earning patterns</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header"><h2>Top expense categories</h2></div>
          {insights.topExpenseCategories.length === 0 ? (
            <div className="empty-state"><div className="icon">📊</div><p>No expense data</p></div>
          ) : insights.topExpenseCategories.map((c, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderBottom:'0.5px solid var(--border)' }}>
              <span style={{ fontSize:12, fontWeight:600, color:'var(--text-hint)', width:20 }}>#{i+1}</span>
              <span style={{ flex:1, fontSize:12, textTransform:'capitalize' }}>{c.category.replace('_',' ')}</span>
              <span className="amt-neg">{fmt(c.total)}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header"><h2>Top income sources</h2></div>
          {insights.topIncomeCategories.length === 0 ? (
            <div className="empty-state"><div className="icon">📊</div><p>No income data</p></div>
          ) : insights.topIncomeCategories.map((c, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderBottom:'0.5px solid var(--border)' }}>
              <span style={{ fontSize:12, fontWeight:600, color:'var(--text-hint)', width:20 }}>#{i+1}</span>
              <span style={{ flex:1, fontSize:12, textTransform:'capitalize' }}>{c.category.replace('_',' ')}</span>
              <span className="amt-pos">{fmt(c.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
