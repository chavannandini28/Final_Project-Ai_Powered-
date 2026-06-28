import { Navigate } from 'react-router-dom';
import apiClient from '@/api/apiClient';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = !!apiClient.getToken();

  if (!isAuthenticated) {
    // Save the current location so we can redirect after login
    localStorage.setItem('returnPath', window.location.pathname);
    return <Navigate to="/Login" replace />;
  }

  return children;
}
