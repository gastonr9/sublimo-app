"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PanelLayoutClient({
  children,
  role,
}: {
  children: React.ReactNode;
  role: string | null;
}) {
  const pathname = usePathname(); // Para resaltar el enlace activo

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
