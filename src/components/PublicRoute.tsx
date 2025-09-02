import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Usamos los mismos roles permitidos definidos en ProtectedRoute
type RolPermitido = "master" | "empleado" | "cliente";

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string; // opcional: adónde redirigir si ya está logueado
}

const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = "/", // por defecto manda al inicio
}) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <p>Cargando...</p>;
  }

  // Si ya hay usuario logueado y rol, redirige
  if (user && role) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
