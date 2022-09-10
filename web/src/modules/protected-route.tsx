import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./auth-context";

type ProtectedRouteProps = {
  allowed: "logged" | "unlogged" | "both";
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowed }) => {
  const auth = useAuth();

  if (allowed === "logged") {
    if (!auth.user) {
      return <Navigate to="/login" />;
    }
  } else if (allowed === "unlogged") {
    if (auth.user) {
      return <Navigate to="/app" />;
    }
  }

  return <Outlet />;
};
