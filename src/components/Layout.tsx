import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LogOut, Menu, Bell, User, Key, FileText, CheckSquare, Home, Users, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';

export default function Layout() {
  const { currentUser, logout, notifications, markNotificationAsRead, fetchActivities, fetchNotifications } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchActivities();
      fetchNotifications();
      
      // Subscribe to realtime notifications
      const notifChannel = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
          },
          (payload) => {
            console.log('Realtime notification received!', payload);
            fetchNotifications();
          }
        )
        .subscribe((status) => {
          console.log('Notification channel status:', status);
        });

      // Subscribe to realtime activities
      const activitiesChannel = supabase
        .channel('public:activities')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'activities',
          },
          (payload) => {
            console.log('Realtime activity received!', payload);
            fetchActivities();
          }
        )
        .subscribe((status) => {
          console.log('Activities channel status:', status);
        });

      return () => {
        supabase.removeChannel(notifChannel);
        supabase.removeChannel(activitiesChannel);
      };
    }
  }, [currentUser, fetchActivities, fetchNotifications]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/login', { replace: true });
  };

  const userNotifications = notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notif: any) => {
    await markNotificationAsRead(notif.id);
    setShowNotifications(false);
    if (currentUser.role === 'pic') {
      navigate('/pic/checklist-pending');
    } else if (currentUser.role === 'user') {
      navigate('/user/monitoring');
    }
  };

  const menuItems = {
    admin: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
      { path: '/admin/kelola-akun', label: 'Kelola Akun', icon: Users },
      { path: '/admin/semua-kegiatan', label: 'Semua Kegiatan', icon: FileText },
      { path: '/ganti-password', label: 'Ganti Password', icon: Key },
    ],
    user: [
      { path: '/user/dashboard', label: 'Dashboard', icon: Home },
      { path: '/user/form-input', label: 'Form Input Kegiatan', icon: FileText },
      { path: '/user/monitoring', label: 'Monitoring Checklist', icon: CheckSquare },
      { path: '/ganti-password', label: 'Ganti Password', icon: Key },
    ],
    pic: [
      { path: '/pic/dashboard', label: 'Dashboard', icon: Home },
      { path: '/pic/checklist-pending', label: 'Checklist Pending', icon: FileText },
      { path: '/pic/checklist-complete', label: 'Checklist Complete', icon: CheckSquare },
      { path: '/ganti-password', label: 'Ganti Password', icon: Key },
    ],
  };

  const currentMenuItems = menuItems[currentUser.role];

  return (
    <div className="min-h-screen bg-slate-50 flex relative overflow-x-hidden">
      {/* Subtle decorative background for main content area */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-blue-200/40 via-indigo-100/20 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/4 translate-x-1/4 z-0" />
      <div className="absolute bottom-0 left-64 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-100/30 via-teal-50/20 to-transparent rounded-full blur-3xl pointer-events-none translate-y-1/4 -translate-x-1/4 z-0" />
      
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden backdrop-blur-sm" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full bg-slate-900 text-white transition-all duration-300 flex flex-col overflow-hidden
          ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:translate-x-0 lg:w-20'}
        `}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.3, 1],
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity,
              ease: "linear" 
            }}
            className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/40 blur-[90px]"
          />
          <motion.div 
            animate={{ 
              rotate: -360,
              scale: [1, 1.4, 1],
            }}
            transition={{ 
              duration: 18, 
              repeat: Infinity,
              ease: "linear" 
            }}
            className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-emerald-500/40 blur-[90px]"
          />
          <motion.div 
            animate={{ 
              y: [0, -50, 0],
              x: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-indigo-500/30 blur-[90px]"
          />
        </div>

        <div className="relative z-10 flex flex-col h-full w-full">
          <div className="flex flex-col items-center justify-center border-b border-white/10 px-4 py-5 shrink-0 text-center min-h-[4rem]">
          {isSidebarOpen ? (
            <>
              <div className="flex items-center justify-center space-x-3 mb-2">
                <img src="/si-monika-logo-Photoroom.png" alt="Logo Si-Monika" className="w-12 h-12 object-contain bg-white rounded-full p-1" referrerPolicy="no-referrer" />
                <h1 className="text-2xl font-bold truncate">Si-Monika</h1>
              </div>
              <p className="text-[10px] leading-tight text-slate-300 font-medium max-w-[200px]">
                Sistem Informasi Monitoring Kelengkapan Dokumen Administrasi Kegiatan
              </p>
              <p className="text-[11px] leading-tight text-slate-100 font-bold mt-1">
                KPU Kabupaten Kerinci
              </p>
            </>
          ) : (
            <div className="hidden lg:flex items-center justify-center">
              <img src="/si-monika-logo-Photoroom.png" alt="Logo Si-Monika" className="w-10 h-10 object-contain bg-white rounded-full p-0.5" referrerPolicy="no-referrer" />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {currentMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white font-semibold shadow-sm backdrop-blur-sm'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 font-medium'
                  }`}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className={`ml-3 truncate transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center px-3 py-3 text-red-400 hover:bg-white/10 hover:text-red-300 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title={!isSidebarOpen ? "Logout" : undefined}
          >
            {isLoggingOut ? (
              <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />
            ) : (
              <LogOut className="w-5 h-5 flex-shrink-0" />
            )}
            <span className={`ml-3 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
              {isLoggingOut ? 'Keluar...' : 'Logout'}
            </span>
          </button>
        </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Topbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10 shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-slate-500 hover:text-slate-700 focus:outline-none p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="ml-2 sm:ml-4 text-xs sm:text-sm font-medium text-slate-600 hidden sm:block">
              {format(currentTime, 'EEEE, dd MMMM yyyy HH:mm:ss', { locale: id })}
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-slate-700 focus:outline-none rounded-full hover:bg-slate-100 transition-colors"
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50">
                  <div className="p-3 sm:p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Notifikasi</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      {unreadCount} baru
                    </span>
                  </div>
                  <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                    {userNotifications.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-sm">Belum ada notifikasi</div>
                    ) : (
                      userNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-3 sm:p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${
                            !notif.isRead ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <p className={`text-xs sm:text-sm ${!notif.isRead ? 'font-medium text-slate-800' : 'text-slate-600'}`}>
                            {notif.message}
                          </p>
                          <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
                            {format(new Date(notif.createdAt), 'dd MMM yyyy HH:mm', { locale: id })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3 border-l border-slate-200 pl-2 sm:pl-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                {currentUser.nama_lengkap.charAt(0)}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-800 leading-none">{currentUser.nama_lengkap}</p>
                <p className="text-xs text-slate-500 mt-1 capitalize">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden w-full max-w-full relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
