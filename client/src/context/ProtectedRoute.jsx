import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute render:', { loading, user: user?.email, userRole: user?.role, allowedRoles });

  // Show loading state while auth is being checked
  if (loading) {
    console.log('ProtectedRoute: Showing loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if no user is authenticated
  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check role authorization if allowedRoles is specified
  if (allowedRoles && allowedRoles.length > 0) {
    // Normalize both user role and allowed roles to lowercase for case-insensitive comparison
    const userRole = user.role?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
    
    // Debug logging (can be removed in production)
    console.log('ProtectedRoute Check:', {
      userRole,
      normalizedAllowedRoles,
      hasAccess: normalizedAllowedRoles.includes(userRole)
    });
    
    // If user doesn't have any of the allowed roles, redirect to login
    if (!userRole || !normalizedAllowedRoles.includes(userRole)) {
      console.log('Access denied: User role does not match allowed roles');
      return <Navigate to="/login" replace />;
    }
  }

  // User is authenticated and authorized
  console.log('ProtectedRoute: Access granted, rendering children');
  return children;
};

export default ProtectedRoute;
