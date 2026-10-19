import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService, checkBackendHealth } from '../services/billingService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isConsumer: boolean;
  backendOnline: boolean | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
  checkStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const checkStatus = async () => {
    const isUp = await checkBackendHealth();
    setBackendOnline(isUp);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    checkStatus().finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const loggedInUser = await authService.login({ username, password });
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isConsumer = user?.role === 'CONSUMER';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isConsumer,
        backendOnline,
        login,
        logout,
        checkStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
