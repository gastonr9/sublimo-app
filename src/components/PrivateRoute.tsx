import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Definimos los roles posibles
type RolPermitido = "master" | "empleado" | "cliente";

interface PrivateRouteProps {
  children: React.ReactNode;
  rolesPermitidos: RolPermitido[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  rolesPermitidos,
}) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!rolesPermitidos.includes(role as RolPermitido)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
