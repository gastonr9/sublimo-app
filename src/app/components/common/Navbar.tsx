"use client";
import Link from "next/link";
import Image from "next/image";
import logo from "../../assets/sublimo.svg";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../../supabase/client";
import { useRouter } from "next/navigation";

type AuthUser = {
  email?: string;
  // agrega otras propiedades si es necesario
};

export default function Navbar() {
  const { user, role, isAuthReady } = useAuth() as {
    user: AuthUser | null;
    role: string | null;
    isAuthReady: boolean;
  }; // Usar el hook del contexto
  const router = useRouter();

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login"); // Redirigir a la página de login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (!isAuthReady) {
    return null; // O muestra un spinner de carga
  }

  return (
    <header className="relative w-full z-50 bg-white shadow-md">
      <div className="relative mx-auto flex max-w-screen-lg flex-col py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="contents">
          <Image
            src={logo}
            className="flex items-center"
            alt="sublimo-logo"
            width={55}
          />
        </Link>

        {/* Botón hamburguesa móvil */}
        <input className="peer hidden" type="checkbox" id="navbar-open" />
        <label
          className="self-end top-7 absolute cursor-pointer text-xl sm:hidden"
          htmlFor="navbar-open"
        >
          <span className="sr-only">Alternar navegación</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#000000"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6l16 0" />
            <path d="M4 12l16 0" />
            <path d="M4 18l16 0" />
          </svg>
        </label>

        {/* Navegación */}
        <nav
          aria-label="Header Navigation"
          className="peer-checked:block hidden pl-2 py-6 sm:block sm:py-0"
        >
          <ul className="flex flex-col gap-y-4 sm:flex-row sm:gap-x-8 items-center">
            <li>
              <Link href="/generador" className=" hover:text-blue-600">
                Generador Mockup 3D
              </Link>
            </li>
            {(role === "employee" || role === "master") && (
              <li>
                <Link href="/burgon" className=" hover:text-blue-600">
                  Burgon
                </Link>
              </li>
            )}
            {(role === "employee" || role === "master") && (
              <li>
                <Link href="/panel/inventario" className=" hover:text-blue-600">
                  Panel
                </Link>
              </li>
            )}

            {user ? (
              <>
                {/* Mostrar email y rol si está logueado */}
                <li className="">
                  {user.email} ({role || "Sin rol"})
                </li>
                <li>
                  <button onClick={handleLogout} className="btn-secondary slot">
                    Salir
                  </button>
                </li>
              </>
            ) : (
              <li>
                <button className="btn-secondary slot">
                  <Link href="/login">Acceder</Link>
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
