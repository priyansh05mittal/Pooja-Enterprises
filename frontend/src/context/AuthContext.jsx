import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  const connectSocket = useCallback((userId) => {
    const s = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', { withCredentials: true });
    s.emit('join', userId);
    setSocket(s);
    return s;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        const s = connectSocket(data.user._id);
        return () => s.disconnect();
      })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, [connectSocket]);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
    connectSocket(userData._id);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    setUser(null);
    socket?.disconnect();
    setSocket(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, socket, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
