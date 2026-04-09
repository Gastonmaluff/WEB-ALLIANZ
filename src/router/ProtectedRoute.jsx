import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "./paths";
import { useAuthSession } from "../hooks/useAuthSession";

export function ProtectedRoute() {
  const { isAuthenticated } = useAuthSession();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.adminLogin} replace />;
  }

  return <Outlet />;
}
