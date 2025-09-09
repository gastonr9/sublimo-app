import {
  createContext,
  useEffect,
  useState,
  useContext,
  type ReactNode,
} from "react";
import { supabase } from "../supabase/Client";

type UserRole = "empleado" | "master";

interface AuthContextType {
  user: any;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  login: async () => {}, // Función login simulada para el valor inicial
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        setRole(profile?.role ?? null);
      }

      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getSession();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login }}>
      {children}
    </AuthContext.Provider>
  );
}
