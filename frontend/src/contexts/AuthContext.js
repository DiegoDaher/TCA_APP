'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuthUser, 
  getAuthToken, 
  isAuthenticated, 
  clearAuth, 
  setupAuthRefresh,
  verifyToken 
} from '@/lib/auth';

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  refreshAuth: () => {},
  clearSession: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuth = () => {
    const currentUser = getAuthUser();
    const currentToken = getAuthToken();
    setUser(currentUser);
    setToken(currentToken);
  };

  const clearSession = () => {
    clearAuth();
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    // Cargar datos de autenticación al montar
    refreshAuth();
    setIsLoading(false);

    // Configurar verificación periódica del token
    const cleanup = setupAuthRefresh();

    // Verificar token al cargar
    verifyToken().then((isValid) => {
      if (!isValid && isAuthenticated()) {
        clearSession();
      }
    });

    return cleanup;
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    refreshAuth,
    clearSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
