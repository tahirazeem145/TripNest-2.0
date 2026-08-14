import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  // Note: Storing tokens in localStorage is used here for client-side demo/development persistence.
  // In a production environment, prefer secure, SameSite, HTTP-only cookies to mitigate XSS exposure.
  const [token, setToken] = useState(() => localStorage.getItem('tripnest_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await authService.getCurrentUser(token);
          setUser(userData);
        } catch (err) {
          console.warn('[AuthContext] Stored session invalid, clearing token.');
          localStorage.removeItem('tripnest_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.accessToken) {
      // Demo/dev session storage
      localStorage.setItem('tripnest_token', res.accessToken);
      setToken(res.accessToken);
    }
    setUser(res.user);
    return res;
  };

  const signup = async (fullName, email, password) => {
    return await authService.signup(fullName, email, password);
  };

  const logout = () => {
    localStorage.removeItem('tripnest_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
