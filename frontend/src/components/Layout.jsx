import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import Logo from './Logo';
import {
  BookOpen,
  LayoutDashboard,
  Calendar,
  RefreshCw,
  BarChart3,
  User,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Compass,
  Flame,
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const { notifications, markNotificationRead, streakCount } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Syllabus Roadmap', path: '/roadmap', icon: <BookOpen className="w-4 h-4" /> },
    { name: 'Daily Planner', path: '/planner', icon: <Calendar className="w-4 h-4" /> },
    { name: 'Revision Queue', path: '/revision', icon: <RefreshCw className="w-4 h-4" /> },
    { name: 'Progress Analytics', path: '/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'My Profile', path: '/profile', icon: <User className="w-4 h-4" /> },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ name: 'Admin Panel', path: '/admin', icon: <Settings className="w-4 h-4" /> });
  }

  const unreadNotifs = notifications.filter(n => !n.isRead);

  // Calculate XP ratio for Level Progress Bar
  const getLevelXPRatio = () => {
    if (!user) return 0;
    const requiredXP = (user.level - 1) * 200 + 100;
    return Math.min((user.xp / requiredXP) * 100, 100);
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans antialiased text-[#111827]">
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR (Width: 260px) */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 bg-white border-r border-[#E5E7EB] w-[260px] z-50 transition-transform duration-200 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 flex flex-col`}
      >
        {/* Sidebar Header: Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#E5E7EB] shrink-0">
          <Link to="/dashboard">
            <Logo textSize="text-base" />
          </Link>
          <button className="md:hidden text-[#6B7280] hover:text-[#111827]" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compass Buddy Avatar & Profile Panel */}
        {user && (
          <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC]">
            <div className="flex items-center space-x-3">
              {/* User Avatar Circle (First letter of name) */}
              <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0 shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-xs text-[#111827] truncate">{user.name}</h4>
                <p className="text-[10px] text-[#6B7280] truncate">
                  {user.profile?.targetRole || 'Software Engineer'}
                </p>
              </div>
            </div>
            
            {/* Level and XP progress */}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between items-center text-[10px] font-semibold text-[#6B7280]">
                <span>Level {user.level}</span>
                <span>{user.xp} XP</span>
              </div>
              <div className="w-full h-1 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] transition-all duration-300"
                  style={{ width: `${getLevelXPRatio()}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50/50 text-[#2563EB] border border-blue-100 shadow-sm'
                    : 'text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-3 h-3 text-[#2563EB]" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="p-3 border-t border-[#E5E7EB] bg-[#F8FAFC]">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-3 py-2 text-xs font-bold text-[#6B7280] hover:text-[#EF4444] hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all duration-150"
          >
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP NAVBAR (Height: 64px / h-16) */}
        <header className="h-16 border-b border-[#E5E7EB] flex items-center justify-between px-6 bg-white shrink-0 z-30">
          <div className="flex items-center space-x-4 flex-1">
            <button className="md:hidden text-[#6B7280] hover:text-[#111827]" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Current Streak Indicator */}
            {user && (
              <div className="flex items-center space-x-1 bg-amber-50 text-[#F59E0B] border border-amber-100 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{streakCount} Days</span>
              </div>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-1.5 text-[#6B7280] hover:text-[#2563EB] hover:bg-[#F8FAFC] rounded-lg relative transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#EF4444] rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {notifDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifDropdownOpen(false)} />
                  <div className="absolute right-0 top-9 w-80 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-2 z-50 max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-[#E5E7EB]">
                      <span className="font-bold text-xs text-[#111827]">Notifications</span>
                      <span className="text-[10px] bg-blue-50 text-[#2563EB] font-bold px-2 py-0.5 rounded">
                        {unreadNotifs.length} new
                      </span>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-[#6B7280]">No alerts triggered yet</div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => {
                            if (!notif.isRead) markNotificationRead(notif._id);
                          }}
                          className={`px-4 py-2.5 border-b border-gray-50 cursor-pointer hover:bg-[#F8FAFC] transition-colors ${
                            !notif.isRead ? 'bg-blue-50/10 font-semibold' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h5 className="text-[11px] text-[#111827]">{notif.title}</h5>
                            {!notif.isRead && (
                              <span className="w-1 h-1 bg-[#2563EB] rounded-full mt-1.5"></span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#6B7280] mt-0.5 leading-normal">{notif.message}</p>
                          <span className="text-[8px] text-[#6B7280] block mt-0.5">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Profile Initials (Profile link) */}
            {user && (
              <Link
                to="/profile"
                className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm hover:border-[#2563EB] transition-colors"
              >
                {user.name.charAt(0).toUpperCase()}
              </Link>
            )}
          </div>
        </header>

        {/* PAGE BODY (Max Width: 1400px, Centered Content) */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="max-w-[1400px] mx-auto w-full px-6 py-6 sm:px-8 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
