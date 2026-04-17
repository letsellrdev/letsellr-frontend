import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
  const role = localStorage.getItem("adminRole");
  const isAuthenticated = !!localStorage.getItem("adminToken");

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (role && !allowedRoles.includes(role)) {
    // Redirect unauthorized roles to the only page they are allowed to access
    return <Navigate to="/admin/properties" replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
  