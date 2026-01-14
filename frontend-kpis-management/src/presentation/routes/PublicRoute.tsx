import { useEffect, useState } from "react";
import { useAuth } from "../../infrastructure/hooks/useAuth"
import { Navigate, Outlet } from "react-router-dom";

export const PublicRoute = () => {
  const { checkAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const verify = async () => {
      const user = await checkAuth();
      setIsAuthenticated(!!user);
      setLoading(false);
    };
    verify();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}