import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = ({ onSwitch }) => {
  const { register, loading } = useAuth();
  const [form, setForm]   = useState({ name:'', email:'', password:'', role:'viewer' });
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const result = await register(form.name, form.email, form.password, form.role);
    if (!result.success) setError(result.message);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💰</div>
          FinanceTracker
        </div>
        <h1>Create account</h1>
        <p>Start tracking your finances</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Full name</label><input name="name" placeholder="Pragya Kashyap" value={form.name} onChange={handleChange} required /></div>
          <div className="form-group"><label>Email</label><input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required /></div>
          <div className="form-group"><label>Password</label><input type="password" name="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required /></div>
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="viewer">Viewer – Read only</option>
              <option value="analyst">Analyst – View + Insights</option>
              <option value="admin">Admin – Full Access</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spinner"></span> Creating...</> : 'Create account'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? <button onClick={onSwitch}>Sign in</button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
