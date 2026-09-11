import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = ({ onSwitch }) => {
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    const result = await register(form.name, form.email, form.password);
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
        <p>Track spending, understand patterns, and make calmer money decisions.</p>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="register-name">Full name</label>
            <input id="register-name" name="name" placeholder="Pragya Kashyap" value={form.name} onChange={handleChange} autoComplete="name" required />
          </div>
          <div className="form-group">
            <label htmlFor="register-email">Email</label>
            <input id="register-email" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} autoComplete="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input id="register-password" type="password" name="password" placeholder="At least 6 characters" value={form.password} onChange={handleChange} autoComplete="new-password" minLength="6" required />
          </div>
          <div className="auth-note">New accounts can add transactions and view insights. Admin access is granted separately.</div>
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
