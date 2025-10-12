"use client";
import Link from "next/link";
import Image from "next/image";
import logo from "../../assets/sublimo.svg";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../../supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AuthUser = {
  email?: string;
};

export default function Navbar() {
  const { user, role, isAuthReady } = useAuth() as {
    user: AuthUser | null;
    role: string | null;
    isAuthReady: boolean;
  };
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="fixed top-0 left-0 right-0 w-full z-50 bg-white shadow-md flex justify-center items-center h-16">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white shadow-lg">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src={logo}
              alt="Sublimo Logo"
              width={55}
              height={55}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="sm:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-600 hover:text-blue-600 focus:outline-none"
            aria-label="Toggle navigation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation and User State */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } sm:flex sm:items-center sm:space-x-8 absolute sm:static top-16 left-0 right-0 bg-white sm:bg-transparent shadow-md sm:shadow-none p-4 sm:p-0`}
        >
          {/* Navigation Links */}
          <nav aria-label="Main Navigation">
            <ul className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 text-lg sm:text-base font-medium">
              <li>
                <Link
                  href="/generador"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Generador Mockup 3D
                </Link>
              </li>
              {(role === "empleado" || role === "admin") && (
                <li>
                  <Link
                    href="/burgon"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Burgon
                  </Link>
                </li>
              )}
              {(role === "empleado" || role === "admin") && (
                <li>
                  <Link
                    href="/panel/inventario"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Panel
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* User State and Login/Logout Button */}
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            {user ? (
              <>
                <span className="text-gray-600 text-sm">
                  {user.email} ({role || "Sin rol"})
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium slot btn-secondary"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link href="/login">
                <button className=" text-sm font-medium slot btn-secondary">
                  Acceder
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
