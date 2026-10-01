import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get('/users/me')
      .then((res) => {
        if (active) setUser(res.data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function register(payload) {
    const res = await api.post('/auth/register', payload);
    setUser(res.data.user);
    return res.data.user;
  }

  async function login(payload) {
    const res = await api.post('/auth/login', payload);
    setUser(res.data.user);
    return res.data.user;
  }

  async function resetPassword(payload) {
    const res = await api.post('/auth/reset-password', payload);
    setUser(res.data.user);
    return res.data.user;
  }

  async function logout() {
    await api.post('/auth/logout');
    setUser(null);
  }

  async function updateProfile(payload) {
    const res = await api.patch('/users/me', payload);
    setUser(res.data.user);
    return res.data.user;
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, resetPassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
