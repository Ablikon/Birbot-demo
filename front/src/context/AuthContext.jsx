import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'birbot_auth';

function getStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredAuth());

  const isAuthenticated = !!user;

  const login = useCallback(({ phone, password }) => {
    // Mock: accept any credentials
    // В реальности имя придёт с бэкенда
    const mockUser = {
      id: 'user_1',
      name: 'Пользователь',
      phone,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    return mockUser;
  }, []);

  const register = useCallback(({ name, phone, password }) => {
    // Mock: accept any data
    const mockUser = {
      id: `user_${Date.now()}`,
      name,
      phone,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    return mockUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
