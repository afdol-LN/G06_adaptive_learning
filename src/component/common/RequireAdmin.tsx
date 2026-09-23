import { Navigate } from "react-router-dom";

interface RequireAdminProps {
  children: React.ReactNode;
}

/**
 * Guard component that restricts access to admin-only routes.
 * Reads the user role from localStorage; if the role is not "admin",
 * redirects the user to /home. Otherwise, renders children normally.
 */
function RequireAdmin({ children }: RequireAdminProps) {
  const userRole = localStorage.getItem("userRole");

  if (userRole !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

export default RequireAdmin;
