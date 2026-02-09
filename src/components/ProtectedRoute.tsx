import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth.core";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

/**
 * Wraps routes that require authentication.
 * - Shows nothing (or a loading UI) while session is being checked.
 * - Redirects to /login if not authenticated, preserving intended URL for post-login redirect.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary"
            aria-hidden
          />
          <p className="text-sm text-muted-foreground">Checking session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
