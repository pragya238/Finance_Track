import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage = ({ onSwitch }) => {
  const { login, loading } = useAuth();
  const [form, setForm]    = useState({ email: '', password: '' });
  const [error, setError]  = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (!result.success) setError(result.message);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💰</div>
          FinanceTracker
        </div>
        <h1>Welcome back</h1>
        <p>Sign in to your account</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spinner"></span> Signing in...</> : 'Sign in'}
          </button>
        </form>

        <div className="auth-link">
          Don't have an account? <button onClick={onSwitch}>Create one</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
