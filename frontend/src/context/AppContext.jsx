import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  const [roadmap, setRoadmap] = useState(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [streakCount, setStreakCount] = useState(0);

  // Trigger global data refetches
  const triggerReload = () => {
    setReloadTrigger(prev => prev + 1);
  };

  // Toast display helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch active roadmap
  const fetchActiveRoadmap = async () => {
    if (!user) return;
    setLoadingRoadmap(true);
    try {
      const res = await api.get('/roadmap/active');
      setRoadmap(res.data);
    } catch (err) {
      console.error('Failed to fetch active roadmap:', err.message);
    } finally {
      setLoadingRoadmap(false);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err.message);
    }
  };

  // Mark notification read
  const markNotificationRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to read notification:', err.message);
    }
  };

  // Run streak risk checks
  const runStreakCheck = async () => {
    if (!user) return;
    try {
      await api.post('/notifications/streak-check');
      fetchNotifications();
    } catch (err) {
      console.error('Failed streak check execution:', err.message);
    }
  };

  // Fetch streak count from analytics
  const fetchStreakCount = async () => {
    if (!user) return;
    try {
      const res = await api.get('/analytics');
      setStreakCount(res.data?.stats?.streakCount || 0);
    } catch (err) {
      console.error('Failed to fetch streak count:', err.message);
    }
  };

  // Fetch active roadmap and notifications when auth user changes
  useEffect(() => {
    if (user) {
      fetchActiveRoadmap();
      fetchNotifications();
      runStreakCheck();
      fetchStreakCount();
      
      // Request browser notification permissions if not set
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } else {
      setRoadmap(null);
      setNotifications([]);
      setStreakCount(0);
    }
  }, [user, reloadTrigger]);

  // Push notification helper to display browser system prompts
  const triggerBrowserNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  return (
    <AppContext.Provider
      value={{
        roadmap,
        loadingRoadmap,
        setRoadmap,
        fetchActiveRoadmap,
        notifications,
        fetchNotifications,
        markNotificationRead,
        toast,
        showToast,
        triggerReload,
        reloadTrigger,
        triggerBrowserNotification,
        streakCount,
        fetchStreakCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
