// AdminControl.tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../supabase/Client";
import Inventario from "../components/Inventario";
import Designs from "../components/Designs";
import Pedidos from "../components/Pedidos";
import RegistrarUsuario from "../components/RegistrarUsuario";
import { usePathname } from "next/navigation"; // To get the current route

export default function AdminControl() {
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname(); // Get current route

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

  // Render the appropriate component based on the current route
  const renderContent = () => {
    if (pathname.includes("inventario")) {
      return <Inventario />;
    } else if (pathname.includes("designs")) {
      return <Designs />;
    } else if (pathname.includes("pedidos")) {
      return <Pedidos />;
    } else if (pathname.includes("usuarios") && role === "master") {
      return <RegistrarUsuario />;
    } else {
      // Default content or redirect
      return <Inventario />; // Default to Inventario
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-md flex flex-col">
        <div className="p-4 text-2xl font-bold text-blue-600">AdminPanel</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/panel/inventario"
            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Inventario
          </Link>
          <Link
            href="/panel/designs"
            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Diseños
          </Link>
          <Link
            href="/panel/pedidos"
            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Pedidos
          </Link>
          {role === "master" && (
            <Link
              href="/panel/usuarios"
              className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Usuarios
            </Link>
          )}
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
    </div>
  );
}
