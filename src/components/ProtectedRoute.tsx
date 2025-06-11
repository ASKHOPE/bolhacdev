import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isAdmin, user } = useAuth(); // user might be needed for other checks or if not fully relying on isAuthenticated

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Authenticated but not an admin, and admin is required
    // Redirect to a general page like dashboard or a specific "access denied" page
    return <Navigate to="/dashboard" replace />;
  }

  // Authenticated and has necessary permissions
  return <>{children}</>;
}