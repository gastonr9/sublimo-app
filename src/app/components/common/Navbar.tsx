// components/Navbar.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import logo from "../../assets/sublimo.svg";
import { useEffect, useState } from "react";
import { supabase } from "../../supabase/Client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any | null>(null); // Estado para el usuario
  const [role, setRole] = useState<string | null>(null); // Estado para el rol
  const router = useRouter();

  // Obtener el estado de autenticación y el rol del usuario
  useEffect(() => {
    const fetchUserAndRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        // Obtener el rol desde la tabla profiles
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setRole(data.role);
        }
      } else {
        setUser(null);
        setRole(null);
      }
    };

    fetchUserAndRole();

    // Escuchar cambios en el estado de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          setRole(null);
        } else {
          // Re-obtener el rol si el usuario cambia
          supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single()
            .then(({ data, error }) => {
              if (!error && data) {
                setRole(data.role);
              }
            });
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login"); // Redirigir a la página de login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

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
              <Link
                href="/generador"
                className="text-gray-600 hover:text-blue-600"
              >
                Generador Mockup 3D
              </Link>
            </li>
            <li>
              <Link
                href="/burgon"
                className="text-gray-600 hover:text-blue-600"
              >
                Burgon
              </Link>
            </li>
            <li>
              <Link href="/panel" className="text-gray-600 hover:text-blue-600">
                Panel
              </Link>
            </li>
            {user ? (
              <>
                {/* Mostrar email y rol si está logueado */}
                <li className="text-gray-600">
                  {user.email} ({role || "Sin rol"})
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary slot text-gray-600 hover:text-blue-600"
                  >
                    Salir
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link href="/login" className="btn-secondary slot">
                  Acceder
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
