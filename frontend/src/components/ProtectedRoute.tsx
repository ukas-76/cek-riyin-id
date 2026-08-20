import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex items-center gap-2 text-primary font-body-md">
          <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
          Memuat sesi...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/masuk" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
