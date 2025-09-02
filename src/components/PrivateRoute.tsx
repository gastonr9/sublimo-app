import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute({
  children,
  rolesPermitidos,
}: {
  children: JSX.Element;
  rolesPermitidos: string[];
}) {
  const { user, role, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;
  if (!user) return <Navigate to="/login" />;
  if (!rolesPermitidos.includes(role)) return <Navigate to="/" />;

  return children;
}

export default PrivateRoute;
