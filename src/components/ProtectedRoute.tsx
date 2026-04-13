import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/auth";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

function getRoleHome(role: UserRole): string {
  switch (role) {
    case "admin": return "/admin";
    case "provider": return "/prestador";
    case "client":
    default: return "/cliente";
  }
}

export function ProtectedRoute({ allowedRoles, redirectTo = "/login/cliente" }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.some((role) => user.roles.includes(role));
    if (!hasRole) {
      return <Navigate to={getRoleHome(user.role)} replace />;
    }
  }

  return <Outlet />;
}
