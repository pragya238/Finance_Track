import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const readStoredUser = () => {
  if (!localStorage.getItem('token')) return null;
  try {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

const clearStoredSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('token');

    if (!token) {
      setInitializing(false);
      return () => { active = false; };
    }

    authAPI.getMe()
      .then((res) => {
        const nextUser = res.data?.data?.user;
        if (!nextUser) throw new Error('Invalid session response');
        if (active) {
          localStorage.setItem('user', JSON.stringify(nextUser));
          setUser(nextUser);
        }
      })
      .catch(() => {
        if (active) {
          clearStoredSession();
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setInitializing(false);
      });

    return () => { active = false; };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({
        email: email.trim().toLowerCase(),
        password,
      });
      const payload = res.data?.data;
      if (!payload?.token || !payload?.user) throw new Error('The server returned an incomplete login response');
      localStorage.setItem('token', payload.token);
      localStorage.setItem('user', JSON.stringify(payload.user));
      setUser(payload.user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message
        || (!err.response ? 'The finance service is unreachable. Please try again in a moment.' : 'Login failed');
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      const payload = res.data?.data;
      if (!payload?.token || !payload?.user) throw new Error('The server returned an incomplete registration response');
      localStorage.setItem('token', payload.token);
      localStorage.setItem('user', JSON.stringify(payload.user));
      setUser(payload.user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message
        || (!err.response ? 'The finance service is unreachable. Please try again in a moment.' : 'Registration failed');
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearStoredSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, initializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
