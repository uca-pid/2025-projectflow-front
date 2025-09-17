import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoadingPage from "@/pages/LoadingPage";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function AdminRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/authenticate" replace />;
  }

  if (!user.role || user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
