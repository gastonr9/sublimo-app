// app/panel/layout.tsx
"use client";
import Link from "next/link";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  type AuthUser = {
    email?: string;
    // agrega otras propiedades si es necesario
  };
  // const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname(); // Para resaltar el enlace activo
  const { user, role, isAuthReady } = useAuth() as {
    user: AuthUser | null;
    role: string | null;
    isAuthReady: boolean;
  }; // Usar el hook del contexto
  const router = useRouter();
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-md flex flex-col">
        <div className="p-4 text-2xl font-bold text-blue-600">AdminPanel</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/panel/inventario"
            className={`block w-full text-left px-4 py-2 rounded-lg ${
              pathname === "/panel/inventario"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            Inventario
          </Link>
          <Link
            href="/panel/designs"
            className={`block w-full text-left px-4 py-2 rounded-lg ${
              pathname === "/panel/designs"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            Diseños
          </Link>
          <Link
            href="/panel/pedidos"
            className={`block w-full text-left px-4 py-2 rounded-lg ${
              pathname === "/panel/pedidos"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            Pedidos
          </Link>
          {role === "master" && (
            <Link
              href="/panel/usuarios"
              className={`block w-full text-left px-4 py-2 rounded-lg ${
                pathname === "/panel/usuarios"
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
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
