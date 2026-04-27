import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  LogOut,
  LayoutDashboard,
  Briefcase,
  Search as SearchIcon,
  FileSearch,
  Settings,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

const Header = () => {
  const { userInfo } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const logoutHandler = () => {
    sessionStorage.removeItem('chatbotMessages');
    dispatch(logout());
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!userInfo) return '/';
    switch (userInfo.role) {
      case 'admin': return '/dashboard/admin';
      case 'client': return '/dashboard/client';
      case 'creative': return '/dashboard/creative';
      default: return '/';
    }
  };

  const navLinkClass = ({ isActive }) =>
    `relative font-medium text-sm flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 ${isActive
      ? 'text-primary-700 bg-primary-50'
      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
    }`;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-gray-200/50 border-b border-gray-100'
          : 'bg-white/50 backdrop-blur-sm'
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold gradient-text">EkrafMate AI</span>
          </Link>

          <nav className="hidden md:flex md:items-center md:gap-1">
            <NavLink to="/search" className={navLinkClass}>
              <SearchIcon className="w-4 h-4" />
              Cari Talenta
            </NavLink>
            <NavLink to="/projects" className={navLinkClass}>
              <Briefcase className="w-4 h-4" />
              Jelajahi Proyek
            </NavLink>
            <NavLink to="/cv-scan" className={navLinkClass}>
              <FileSearch className="w-4 h-4" />
              Scan CV
            </NavLink>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {userInfo ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {userInfo.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 max-w-[120px] truncate">
                    {userInfo.name}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20 overflow-hidden"
                      >
                        <div className="px-4 py-2.5 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900 truncate">{userInfo.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{userInfo.role}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            to={getDashboardLink()}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                          </Link>
                          <Link
                            to="/settings/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                          >
                            <Settings className="w-4 h-4" /> Pengaturan
                          </Link>
                        </div>
                        <div className="border-t border-gray-100 pt-1">
                          <button
                            onClick={() => { setDropdownOpen(false); logoutHandler(); }}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Logout
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-primary-600 rounded-lg transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5 transition-all duration-200"
                >
                  Daftar Gratis
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-4 space-y-1">
              <NavLink
                to="/search"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <SearchIcon className="w-4 h-4" /> Cari Talenta
              </NavLink>

              <NavLink
                to="/projects"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <Briefcase className="w-4 h-4" /> Jelajahi Proyek
              </NavLink>

              <NavLink
                to="/cv-scan"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <FileSearch className="w-4 h-4" /> Scan CV
              </NavLink>

              <hr className="my-2 border-gray-100" />

              {userInfo ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 mb-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{userInfo.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{userInfo.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{userInfo.role}</p>
                    </div>
                  </div>
                  <Link to={getDashboardLink()} className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link to="/settings/profile" className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl">
                    <Settings className="w-4 h-4" /> Pengaturan
                  </Link>
                  <button onClick={logoutHandler} className="flex w-full items-center gap-3 px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link to="/login" className="block text-center px-4 py-2.5 text-sm font-semibold text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors">
                    Masuk
                  </Link>
                  <Link to="/register" className="block text-center px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl">
                    Daftar Gratis
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
