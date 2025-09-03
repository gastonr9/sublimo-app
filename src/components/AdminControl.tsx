// AdminControl.tsx
import { Link, Routes, Route, Navigate } from "react-router-dom";
import Inventario from "./Inventario";
import Designs from "./Designs";
import Pedidos from "./Pedidos";
import PrivateRoute from "../components/PrivateRoute";
import { useEffect, useState } from "react";
import { supabase } from "../supabase/Client";
import RegistrarUsuario from "./RegistrarUsuario";

export default function AdminControl() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setRole(data.role);
        }
      }
    };

    fetchRole();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-md flex flex-col">
        <div className="p-4 text-2xl font-bold text-blue-600">AdminPanel</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/panel/inventario"
            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Inventario
          </Link>
          <Link
            to="/panel/designs"
            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Diseños
          </Link>
          <Link
            to="/panel/pedidos"
            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Pedidos
          </Link>

          {/* 👇 Solo mostrar si el role es master */}
          {role === "master" && (
            <Link
              to="/panel/usuarios"
              className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Usuarios
            </Link>
          )}
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Routes>
          <Route path="inventario" element={<Inventario />} />
          <Route path="designs" element={<Designs />} />
          <Route path="pedidos" element={<Pedidos />} />
          {/* 🔒 Solo role master puede entrar */}
          <Route
            path="usuarios"
            element={
              <PrivateRoute rolesPermitidos={["master"]}>
                <RegistrarUsuario />
              </PrivateRoute>
            }
          />
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="inventario" replace />} />
        </Routes>
      </main>
    </div>
  );
}
