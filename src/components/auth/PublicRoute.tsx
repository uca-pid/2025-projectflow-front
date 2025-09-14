import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoadingPage from "@/pages/LoadingPage";

type PublicRouteProps = {
  children: React.ReactNode;
};

export default function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
