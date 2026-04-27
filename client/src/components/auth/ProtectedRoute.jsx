import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ allowedRoles }) => {
  const { userInfo } = useAuth();

  if (!userInfo) {
    // Jika tidak login, redirect ke halaman login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
    // Jika login tapi role tidak sesuai, redirect ke halaman utama
    return <Navigate to="/" replace />;
  }

  // Jika login dan role sesuai, tampilkan konten
  return <Outlet />;
};

export default ProtectedRoute;
