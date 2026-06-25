import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Layout = ({ children }) => {
  const location = useLocation();
  const { logout, user } = useContext(AuthContext);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const fetchStreak = async () => {
      if (user) {
        try {
          const res = await api.get('/analytics');
          setStreak(res.data.stats?.streakCount || 0);
        } catch (err) {
          console.log('Failed to fetch streak in layout', err);
        }
      }
    };
    fetchStreak();

    window.addEventListener('profile-reloaded', fetchStreak);
    return () => window.removeEventListener('profile-reloaded', fetchStreak);
  }, [user]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const cleanName = name.trim();
    if (!cleanName) return 'U';
    const parts = cleanName.split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return cleanName.substring(0, 2).toUpperCase();
  };

  const userInitials = getInitials(user?.name);
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const sidebarLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Pathways', path: '/roadmap', icon: 'moving' },
    { name: 'Planner', path: '/planner', icon: 'calendar_today' },
    { name: 'Insights', path: '/insights', icon: 'insights' },
  ];

  const mobileNavLinks = [
    { path: '/dashboard', icon: 'home' },
    { path: '/roadmap', icon: 'moving' },
    { path: '/planner', icon: 'calendar_today' },
    { path: '/insights', icon: 'insights' },
    { path: '/settings', icon: 'person' },
  ];

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col md:flex-row relative">
      {/* Navigation Drawer (Desktop Sidebar) */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant/20 p-6 space-y-stack-md z-50">
        <div className="mb-8">
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <Logo textSize="text-lg" />
          </Link>
        </div>
        <nav className="flex-1 flex flex-col space-y-2">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold translate-x-1'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined">{link.icon}</span>
                <span className="font-label-md text-label-md">{link.name}</span>
              </Link>
            );
          })}
          
          <div className="pt-8 mt-auto">
            <Link
              to="/settings"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                location.pathname === '/settings'
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">settings</span>
              <span className="font-label-md text-label-md">Settings</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen relative pb-24 md:pb-0">
        {/* Top App Bar */}
        <header className="sticky top-0 w-full z-40 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <span className="material-symbols-outlined text-primary text-xl md:text-2xl">local_fire_department</span>
            <span className="font-headline-md text-base sm:text-lg md:text-headline-md font-bold text-primary">Career GPS</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 relative">
            {streak > 0 && (
              <div className="flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-50 border border-orange-200 text-orange-600 rounded-full font-bold text-xs sm:text-sm shadow-sm animate-in fade-in zoom-in duration-300">
                <span className="material-symbols-outlined text-base sm:text-lg fill-current">local_fire_department</span>
                <span>{streak}d</span>
              </div>
            )}
            
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="relative p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-all active:scale-95 flex items-center justify-center animate-in"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-surface">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-outline-variant/30 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                  {/* Header */}
                  <div className="p-3 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/40">
                    <span className="font-bold text-xs text-on-surface">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => {
                          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        }}
                        className="text-[9px] text-primary font-bold hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-64 overflow-y-auto divide-y divide-outline-variant/15 custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => {
                            setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: !item.read } : item));
                          }}
                          className={`p-3 flex items-start gap-3 hover:bg-surface-container-low transition-colors cursor-pointer relative ${
                            !n.read ? 'bg-primary/5 font-semibold' : ''
                          }`}
                        >
                          {!n.read && (
                            <span className="w-1.5 h-1.5 bg-primary rounded-full absolute left-2 top-4"></span>
                          )}

                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ml-1.5 ${n.color}`}>
                            <span className="material-symbols-outlined text-[16px]">{n.icon}</span>
                          </div>

                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex justify-between items-start gap-1">
                              <h5 className="text-xs font-bold text-on-surface truncate">{n.title}</h5>
                              <span className="text-[9px] text-on-surface-variant shrink-0 font-normal">{n.time}</span>
                            </div>
                            <p className="text-[11px] text-on-surface-variant leading-normal mt-0.5 pr-2 font-normal">
                              {n.description}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 px-4 flex flex-col items-center justify-center text-center gap-2">
                        <span className="material-symbols-outlined text-outline/45 text-2xl animate-pulse">notifications_paused</span>
                        <p className="text-xs font-bold text-on-surface">Inbox is empty</p>
                        <p className="text-[10px] text-on-surface-variant max-w-[200px] leading-normal">
                          We'll notify you when quizzes are unlocked or feedback is ready.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-2 border-t border-outline-variant/15 flex justify-end bg-surface-container-low/20">
                      <button 
                        onClick={() => setNotifications([])}
                        className="text-[9px] text-on-surface-variant hover:text-error font-bold px-2 py-1 rounded transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-[10px] text-on-primary-container font-bold shadow-inner hover:scale-105 active:scale-95 transition-transform"
              >
                {userInitials}
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-outline-variant/30 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Link 
                    to="/settings" 
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">settings</span>
                    <span>Settings</span>
                  </Link>
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors text-left font-semibold"
                  >
                    <span className="material-symbols-outlined text-sm text-error">logout</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Render Outlet */}
        <main className="flex-1 max-w-container-max mx-auto p-margin-mobile md:p-margin-desktop w-full">
          {children}
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 md:hidden px-margin-mobile pb-safe bg-surface/90 backdrop-blur-lg border-t border-outline-variant/30 shadow-lg">
        {mobileNavLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`p-2 rounded-full transition-all ${
                isActive
                  ? 'bg-primary-container text-on-primary-container scale-90 duration-150 shadow-md'
                  : 'text-on-surface-variant hover:bg-surface-container-highest/20'
              }`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
            </Link>
          );
        })}
      {/* Custom Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
            <div className="w-12 h-12 bg-error/10 text-error flex items-center justify-center rounded-full mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl">logout</span>
            </div>
            <h3 className="font-headline-md text-lg text-on-surface font-bold mb-2">Confirm Logout</h3>
            <p className="font-body-sm text-on-surface-variant mb-6 leading-relaxed">
              Are you sure you want to end your learning session and log out of Career GPS?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-label-md rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowLogoutConfirm(false);
                  await logout();
                }}
                className="flex-1 px-4 py-2.5 bg-error hover:bg-error/90 text-white font-bold text-label-md rounded-lg transition-colors cursor-pointer"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
      </nav>
    </div>
  );
};

export default Layout;
