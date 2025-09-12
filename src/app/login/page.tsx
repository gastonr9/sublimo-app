"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase/Client";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Intenta iniciar sesión con el correo y la contraseña
      const {
        error: signInError,
        data: { user },
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      // Si el login es exitoso, busca el rol del usuario en la tabla 'profiles'
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user?.id)
        .single();

      if (profileError || !profileData) {
        // En caso de error o si no se encuentra el perfil, redirige a una página de error o al panel por defecto.
        console.error("Error al obtener el perfil:", profileError?.message);
        router.push("/panel/inventario");
        return;
      }

      // Redirige según el rol del usuario
      if (profileData.role === "master") {
        router.push("/panel/inventario");
      } else {
        router.push("/panel/inventario"); // O a otra página para los empleados
      }
    } catch (err: any) {
      console.error("Error de login:", err.message);
      setError("❌ Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Acceder</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border rounded-lg p-2 w-full mb-3"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border rounded-lg p-2 w-full mb-4"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}

// ### Cómo crear tu usuario 'master' desde la base de datos

// Debido a que el rol de "master" es un permiso de alto nivel, la forma más segura de crear un usuario con este rol es hacerlo manualmente en la base de datos. No deberías permitir que los usuarios se registren directamente con este rol desde el frontend.

// Sigue estos dos sencillos pasos:

// #### 1. Crea el usuario en Supabase Authentication

// Ve al panel de control de Supabase, navega a la sección **Authentication** y luego a la pestaña **Users**. Haz clic en **"Invite"** o **"Add user"** para crear un nuevo usuario con el correo electrónico y la contraseña que desees.

// #### 2. Actualiza el rol en la tabla `profiles`

// Ahora, necesitas cambiar manualmente el rol de este nuevo usuario de `'employee'` (el valor por defecto) a `'master'`.

// -   Ve a la sección **SQL Editor** en Supabase.
// -   Copia y pega la siguiente consulta.
// -   **Importante:** Antes de ejecutarla, debes reemplazar `'TU_UUID_DE_USUARIO'` con el ID del usuario que acabas de crear. Puedes encontrar este ID en la tabla `auth.users` dentro de la sección **Table Editor**.

// ```sql
// UPDATE public.profiles
// SET role = 'master'
// WHERE id = 'TU_UUID_DE_USUARIO';
