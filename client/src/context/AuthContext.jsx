import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/profile');
        setUser(res.data);
      } catch (err) {
        console.log('Session restore failed. Session might be expired.');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for logout events dispatched by Axios interceptor failures
    const handleLogoutEvent = () => {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => window.removeEventListener('auth-logout', handleLogoutEvent);
  }, []);

  // Register
  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  };

  // Login
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, ...userData } = res.data;
    
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    
    setUser(userData);
    return userData;
  };

  // Logout
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  // Update Profile details
  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    const { message, ...updatedUser } = res.data;
    setUser(prev => ({ ...prev, ...updatedUser }));
    return res.data;
  };

  // Reload profile details to sync XP / Level updates
  const reloadUserProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setUser(res.data);
    } catch (err) {
      console.log('Failed to reload profile details');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        setUser,
        reloadUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
