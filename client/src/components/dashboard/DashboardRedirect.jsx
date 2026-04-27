import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const DashboardRedirect = () => {
    const { userInfo } = useSelector((state) => state.auth);

    if (!userInfo) return <Navigate to="/login" />;

    switch (userInfo.role) {
        case 'creative':
            return <Navigate to="/dashboard/creative" />;
        case 'client':
            return <Navigate to="/dashboard/client" />;
        case 'admin':
            return <Navigate to="/dashboard/admin" />;
        default:
            return <Navigate to="/" />;
    }
}

export default DashboardRedirect;
