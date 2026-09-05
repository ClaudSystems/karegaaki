// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const admin = useAuthStore((s) => s.admin);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && admin && !allowedRoles.includes(admin.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}