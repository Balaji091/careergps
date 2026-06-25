import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin">sync</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to onboarding if profile targetRole is not set and the current path is not already onboarding
  if (!user.profile?.targetRole && !location.pathname.startsWith('/onboarding')) {
    return <Navigate to="/onboarding/role" replace />;
  }

  return children;
};

export default ProtectedRoute;
