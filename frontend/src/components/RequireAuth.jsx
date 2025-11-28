import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function RequireAuth() {
  let token = null;
  try {
    token = localStorage.getItem("token");
  } catch {
    token = null;
  }
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
