import { createContext, useContext, useState, useCallback } from 'react';
import { authAPI, TOKEN_KEY } from '../services/api';

const AuthContext = createContext(null);

const AUTH_KEY = 'birbot_auth';

function getStoredAuth() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(AUTH_KEY);
    if (token && raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredAuth());

  const isAuthenticated = !!user;

  const login = useCallback(async ({ email, password }) => {
    const { data } = await authAPI.login(email, password);
    const token = data.access_token;
    localStorage.setItem(TOKEN_KEY, token);

    // Try to get profile info
    let profile = { email };
    try {
      const { data: profileData } = await authAPI.getProfile();
      profile = { ...profile, ...profileData };
    } catch {
      // Profile endpoint may not exist yet
    }

    const userData = {
      id: profile._id || profile.id || 'user',
      name: profile.name || profile.email || email,
      email: profile.email || email,
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async ({ name, phone, password }) => {
    // Registration endpoint not yet available — mock for now
    const mockUser = {
      id: `user_${Date.now()}`,
      name,
      phone,
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
    localStorage.setItem(TOKEN_KEY, 'mock_token_' + Date.now());
    setUser(mockUser);
    return mockUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_KEY);
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
