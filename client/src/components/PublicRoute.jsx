import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CompassLoader from './CompassLoader';

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <CompassLoader fullScreen />;
  }

  if (user) {
    return <Navigate to="/roadmap" replace />;
  }

  return children;
};

export default PublicRoute;
