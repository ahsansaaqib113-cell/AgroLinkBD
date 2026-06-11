import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
  Sun,
  Moon,
  ShoppingCart,
  User,
  Menu,
  X,
  Sprout,
  LogOut,
  Bell,
  LayoutDashboard,
  Leaf
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const res = await api.get('/notifications');
        if (res.data.success) {
          setNotifications(res.data.notifications);
          setUnreadCount(res.data.notifications.filter(n => !n.isRead).length);
        }
      } catch (err) {
        console.error('Failed to load notifications');
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Poll every 20s
    return () => clearInterval(interval);
  }, [user]);

  const handleNotificationRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin-dashboard';
    if (user.role === 'farmer') return '/farmer-dashboard';
    if (user.role === 'business') return '/business-dashboard';
    return '/profile'; // customers go to profile
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/75 backdrop-blur-md dark:border-slate-800/30 dark:bg-slate-900/75 shadow-sm transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
              <Sprout className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold font-sans tracking-tight dark:text-white">
              AgroLink <span className="text-emerald-500">BD</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 hover:text-emerald-500 dark:text-slate-300 dark:hover:text-emerald-400'
              }`}
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              className={`text-sm font-medium transition-colors ${
                isActive('/marketplace') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 hover:text-emerald-500 dark:text-slate-300 dark:hover:text-emerald-400'
              }`}
            >
              Marketplace
            </Link>
            <Link
              to="/crop-disease"
              className={`text-sm font-medium transition-colors ${
                isActive('/crop-disease') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 hover:text-emerald-500 dark:text-slate-300 dark:hover:text-emerald-400'
              }`}
            >
              Crop Disease AI
            </Link>
          </div>

          {/* Desktop Right Side Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Shopping Cart (only for customers/guests/business) */}
            {(!user || user.role === 'customer' || user.role === 'business') && (
              <Link
                to="/cart"
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-md ring-2 ring-white dark:ring-slate-900">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notification Bell (only logged in) */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md ring-2 ring-white dark:ring-slate-900">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900 z-50">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-semibold dark:text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-emerald-500 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto mt-1">
                      {notifications.length === 0 ? (
                        <div className="py-4 text-center text-xs text-slate-400">No notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationRead(n._id)}
                            className={`p-3 rounded-lg text-left text-xs transition-colors cursor-pointer mb-1 ${
                              n.isRead ? 'bg-transparent text-slate-500' : 'bg-emerald-50/50 hover:bg-emerald-50 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 text-slate-800 dark:text-white'
                            }`}
                          >
                            <p className="font-semibold">{n.title}</p>
                            <p className="mt-0.5 text-slate-500 dark:text-slate-400">{n.message}</p>
                            <span className="text-[9px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Account Controls */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center space-x-2 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-emerald-500 dark:text-slate-300 dark:hover:text-emerald-400"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-600 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-500 dark:text-slate-400"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Links */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 transition-colors duration-300">
          <div className="flex flex-col space-y-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`text-sm font-medium ${isActive('/') ? 'text-emerald-600' : 'text-slate-600'}`}
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              onClick={() => setIsOpen(false)}
              className={`text-sm font-medium ${isActive('/marketplace') ? 'text-emerald-600' : 'text-slate-600'}`}
            >
              Marketplace
            </Link>
            <Link
              to="/crop-disease"
              onClick={() => setIsOpen(false)}
              className={`text-sm font-medium ${isActive('/crop-disease') ? 'text-emerald-600' : 'text-slate-600'}`}
            >
              Crop Disease AI
            </Link>
            {(!user || user.role === 'customer' || user.role === 'business') && (
              <Link
                to="/cart"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between text-sm font-medium text-slate-600"
              >
                <span>Cart</span>
                <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs text-white">{cartCount}</span>
              </Link>
            )}
            <hr className="border-slate-100 dark:border-slate-800" />
            {user ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Go to Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-left text-sm font-medium text-red-500"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center rounded-xl border border-slate-200 py-2 text-sm font-medium dark:border-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="text-center rounded-xl bg-emerald-500 py-2 text-sm font-medium text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
