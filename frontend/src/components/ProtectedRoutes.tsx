import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { isTokenValid } from '../utils/auth'; 

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isTokenValid();
      setIsAuthenticated(authenticated);
      setIsValidating(false);
    };

    checkAuth();
  }, []);

  if (isValidating) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};