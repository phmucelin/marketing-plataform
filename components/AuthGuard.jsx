import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '@/lib/auth.js';

export default function AuthGuard({ children }) {
  const isUserAuthenticated = isAuthenticated();
  
  if (!isUserAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
