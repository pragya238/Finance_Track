import React, { useState } from 'react';
import { transactionAPI } from '../services/api';

const CATEGORIES = {
  income:  ['salary', 'freelance', 'investment', 'gift', 'other_income'],
  expense: ['food', 'transport', 'housing', 'utilities', 'healthcare', 'entertainment', 'shopping', 'education', 'travel', 'other_expense'],
};

const AddTransactionModal = ({ onClose, onAdded }) => {
  const [form, setForm]   = useState({
    amount: '',
    type: 'expense',
    category: 'food',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'type') {
      setForm({ ...form, type: value, category: CATEGORIES[value][0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await transactionAPI.create({ ...form, amount: parseFloat(form.amount) });
      onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Transaction</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES[form.type].map((c) => (
                <option key={c} value={c}>{c.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description (optional)</label>
            <input
              name="description"
              placeholder="Short note..."
              value={form.description}
              onChange={handleChange}
              maxLength={200}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={loading}>
              {loading ? <><span className="spinner"></span> Saving...</> : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
