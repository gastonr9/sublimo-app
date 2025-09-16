"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../supabase/client";

// 1. Crea el contexto
const AuthContext = createContext<{
  user: any | null;
  role: string | null;
  isAuthReady: boolean;
}>({
  user: null,
  role: null,
  isAuthReady: false,
});

// 2. Crea el proveedor que gestionará el estado
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Función asíncrona para obtener el usuario y el rol
    const fetchUserAndRole = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error al obtener el usuario:", userError);
          setUser(null);
          setRole(null);
          setIsAuthReady(true);
          return;
        }

        setUser(user);

        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error al obtener el perfil:", error);
            setRole(null);
          } else if (data) {
            setRole(data.role);
          } else {
            setRole(null);
          }
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error("Error inesperado:", error);
        setRole(null);
      } finally {
        setIsAuthReady(true);
      }
    };

    fetchUserAndRole();

    // Escucha los cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserAndRole(); // Vuelve a obtener el rol si el usuario cambia
        } else {
          setRole(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    // 3. Provee el estado a toda la aplicación
    <AuthContext.Provider value={{ user, role, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Crea un hook para consumir el contexto fácilmente
export const useAuth = () => useContext(AuthContext);
