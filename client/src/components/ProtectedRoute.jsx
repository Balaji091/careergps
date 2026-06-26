import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CompassLoader from './CompassLoader';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <CompassLoader fullScreen />;
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
