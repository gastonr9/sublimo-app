// app/panel/layout.tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../supabase/Client";
import { useRouter } from "next/navigation";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("login"); // Redirect to login if not authenticated
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setRole(data.role);
      }
    };

    fetchRole();
  }, [router]);

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
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
