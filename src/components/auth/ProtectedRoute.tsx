import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoadingPage from "@/pages/LoadingPage";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/authenticate" replace />;
  }

  return <>{children}</>;
}
