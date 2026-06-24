import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ROUTES_BY_ROLE } from './roles';

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is already authenticated, redirect to their dashboard
  if (user) {
    const userRole = user.role?.toLowerCase();
    const redirectPath = ROUTES_BY_ROLE[userRole] || '/';
    console.log('GuestRoute: User already authenticated, redirecting to:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  // User is not authenticated, allow access to the page
  return children;
};

export default GuestRoute;
