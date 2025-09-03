import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({
  children,
  rolesPermitidos,
}: {
  children: React.ReactElement;
  rolesPermitidos: ("empleado" | "master")[];
}) {
  const { user, role, loading } = useContext(AuthContext);

  if (loading) return <p>Cargando...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user) return <Navigate to="/usuarios" replace />;
  if (!rolesPermitidos.includes(role!)) return <Navigate to="/" replace />;

  return children;
}
