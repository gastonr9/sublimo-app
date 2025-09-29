// AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../supabase/client";
import type { User } from "@supabase/supabase-js";

const AuthContext = createContext<{
  user: User | null;
  role: string | null;
  isAuthReady: boolean;
}>({
  user: null,
  role: null,
  isAuthReady: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const fetchUserRole = async (currentUser: User) => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("rol")
      .eq("id", currentUser.id) // usamos directamente el id del user recibido
      .single();

    if (error) {
      console.error("Error al obtener el rol:", error);
      setRole(null);
    } else {
      setRole(data?.rol ?? null);
    }
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      if (user) {
        await fetchUserRole(user);
      }
      setIsAuthReady(true);
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserRole(session.user);
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
    <AuthContext.Provider value={{ user, role, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
