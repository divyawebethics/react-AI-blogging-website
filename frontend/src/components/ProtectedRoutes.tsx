import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const authContext = useContext(AuthContext);

  if (!authContext?.user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && authContext.user.role !== requiredRole) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};