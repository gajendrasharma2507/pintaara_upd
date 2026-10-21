'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { safeStorage } from '@/lib/storage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Load stored token and validate with backend Sanctum on mount
    const storedToken = safeStorage.getItem('pintaara_token');
    const storedUser = safeStorage.getItem('pintaara_user');

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse cached user:', e);
        }
      }

      // Validate token with live backend
      api.getProfile()
        .then((res) => {
          if (res && res.user) {
            setUser(res.user);
            safeStorage.setItem('pintaara_user', JSON.stringify(res.user));
          }
        })
        .catch(() => {
          // Token expired or invalid
          safeStorage.removeItem('pintaara_token');
          safeStorage.removeItem('pintaara_user');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    setAuthError(null);
    try {
      const res = await api.login(credentials);

      if (res && res.requires_otp) {
        return res;
      }

      if (res && (res.token || res.status === 'success')) {
        const loggedUser = res.user;
        const loggedToken = res.token;

        setToken(loggedToken);
        setUser(loggedUser);
        safeStorage.setItem('pintaara_token', loggedToken);
        safeStorage.setItem('pintaara_user', JSON.stringify(loggedUser));
        return loggedUser;
      }

      throw new Error(res?.message || 'Login failed');
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    try {
      const res = await api.register(userData);
      return res;
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      throw err;
    }
  };

  const verifyOtp = async ({ email, otp, purpose = 'registration' }) => {
    setAuthError(null);
    try {
      const res = await api.verifyOtp({ email, otp, purpose });
      if (res && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        safeStorage.setItem('pintaara_token', res.token);
        safeStorage.setItem('pintaara_user', JSON.stringify(res.user));
        return res.user;
      }
      return res;
    } catch (err) {
      setAuthError(err.message || 'Verification failed');
      throw err;
    }
  };

  const resendOtp = async ({ email, purpose = 'registration' }) => {
    return await api.resendOtp({ email, purpose });
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setToken(null);
      setUser(null);
      safeStorage.removeItem('pintaara_token');
      safeStorage.removeItem('pintaara_user');
    }
  };

  const updateProfile = async (data) => {
    try {
      const res = await api.updateProfile(data);
      const updatedUser = res?.user || { ...user, ...data };
      setUser(updatedUser);
      safeStorage.setItem('pintaara_user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    } catch (err) {
      // Local fallback if needed
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      safeStorage.setItem('pintaara_user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await api.getProfile();
      if (res && res.user) {
        setUser(res.user);
        safeStorage.setItem('pintaara_user', JSON.stringify(res.user));
        return res.user;
      }
    } catch (e) {}
    return user;
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isUser = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        updateProfile,
        refreshProfile,
        isAdmin,
        isUser,
      }}
    >
      {children}
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
