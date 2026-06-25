import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin">sync</span>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/roadmap" replace />;
  }

  return children;
};

export default PublicRoute;
