import { createBrowserRouter, Navigate } from "react-router-dom";
import FitTrackPage from "@/pages/fittrack/page";
import LoginPage from "@/pages/login/page";
import SignupPage from "@/pages/signup/page";
import ForgotPasswordPage from "@/pages/forgot-password/page";
import ResetPasswordPage from "@/pages/reset-password/page";
import AnalyticsPage from "@/pages/fittrack/analytics-page";
import HealthPage from "@/pages/health/page";
import { useAuthStore } from "@/store/auth-store";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/tracker" replace />;
  }
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthRedirect>
        <Navigate to="/login" replace />
      </AuthRedirect>
    ),
  },
  {
    path: "/login",
    element: (
      <AuthRedirect>
        <LoginPage />
      </AuthRedirect>
    ),
  },
  {
    path: "/signup",
    element: (
      <AuthRedirect>
        <SignupPage />
      </AuthRedirect>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <AuthRedirect>
        <ForgotPasswordPage />
      </AuthRedirect>
    ),
  },
  {
    path: "/reset-password/:token",
    element: (
      <AuthRedirect>
        <ResetPasswordPage />
      </AuthRedirect>
    ),
  },
  {
    path: "/tracker",
    element: (
      <ProtectedRoute>
        <FitTrackPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/analytics",
    element: (
      <ProtectedRoute>
        <AnalyticsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/health",
    element: (
      <ProtectedRoute>
        <HealthPage />
      </ProtectedRoute>
    ),
  },
]);
