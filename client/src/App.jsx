import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { logout } from './redux/slices/authSlice';
import toast, { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import SearchPage from './pages/search/SearchPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CreativeDashboardPage from './pages/dashboard/CreativeDashboardPage';
import ClientDashboardPage from './pages/dashboard/ClientDashboardPage';
import AdminDashboardPage from './pages/dashboard/AdminDashboardPage';
import DashboardRedirect from './components/dashboard/DashboardRedirect';
import Chatbot from './components/chatbot/Chatbot';
import PublicProfilePage from './pages/profile/PublicProfilePage';
import ProfileSettingsPage from './pages/profile/ProfileSettingsPage';
import AdminUserEditPage from './pages/dashboard/AdminUserEditPage';
import VerificationPage from './pages/auth/VerificationPage';
import ProjectListPage from './pages/projects/ProjectListPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import ProjectEditPage from './pages/projects/ProjectEditPage';
import CVScanPage from './pages/cv-scan/CVScanPage';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
};

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token expired or invalid
          dispatch(logout());
          sessionStorage.removeItem('chatbotMessages');
          toast.error('Sesi Anda telah berakhir. Silakan login kembali.', { id: 'session-expired' });
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate, dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <ScrollToTop />
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Rute Publik */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile/:id" element={<PublicProfilePage />} />
          <Route path="/verify/:token" element={<VerificationPage />} />
          <Route path="/verification-success" element={<VerificationPage success />} />
          <Route path="/projects" element={<ProjectListPage />} />
          <Route path="/project/:id" element={<ProjectDetailPage />} />
          <Route path="/cv-scan" element={<CVScanPage />} />

          {/* Rute Terproteksi */}
          <Route element={<ProtectedRoute allowedRoles={['creative', 'client', 'admin']} />}>
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/settings/profile" element={<ProfileSettingsPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['creative']} />}>
            <Route path="/dashboard/creative" element={<CreativeDashboardPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['client']} />}>
            <Route path="/dashboard/client" element={<ClientDashboardPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/user/:id/edit" element={<AdminUserEditPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['client', 'admin']} />}>
            <Route path="/project/:id/edit" element={<ProjectEditPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <Chatbot />
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export default App;
