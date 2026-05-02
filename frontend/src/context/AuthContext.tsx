import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, type User } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; avatar?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoading(false); return; }

    authApi.me()
      .then(({ data }) => setUser(data))
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authApi.login(email, password);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    await authApi.signup(name, email, password);
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* best-effort */ }
    clearTokens();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; avatar?: string }) => {
    const { data: updated } = await authApi.updateProfile(data);
    setUser(updated);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
