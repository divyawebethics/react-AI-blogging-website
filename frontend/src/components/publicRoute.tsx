import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { isTokenValid } from "../utils/auth";

export const PublicRoute = ({ children }: { children: ReactElement }) => {
  const isAuthenticated = isTokenValid();

  return isAuthenticated ? <Navigate to="/post" replace /> : children;
};
