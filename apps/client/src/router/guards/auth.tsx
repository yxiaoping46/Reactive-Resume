import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/client/providers/auth.provider";

export const AuthGuard = () => {
  const location = useLocation();
  const { session, loading } = useAuth();

  if (loading) return null;

  if (!session) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
