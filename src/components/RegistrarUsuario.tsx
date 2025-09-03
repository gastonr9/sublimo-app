/* import { useState } from "react";
import { supabase } from "../supabase/Client";

interface NuevoUsuario {
  nombre: string;
  email: string;
  password: string;
}

export default function RegistrarUsuario() {
  const [nuevoUsuario, setNuevoUsuario] = useState<NuevoUsuario>({
    nombre: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user)
        throw new Error("Debes estar autenticado para registrar usuarios");

      const res = await fetch(
        "https://ylribvdantmmbkezejhr.supabase.co/functions/v1/create-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            "x-user-id": user.id,
          },
          body: JSON.stringify({
            email: nuevoUsuario.email,
            nombre: nuevoUsuario.nombre,
            password: nuevoUsuario.password,
          }),
        }
      );

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(
          data.error || `Error al registrar usuario (código ${res.status})`
        );
      }

      setSuccess("Usuario registrado exitosamente");
      setNuevoUsuario({ nombre: "", email: "", password: "" }); // Limpia el formulario
    } catch (err) {
      console.error("Error en handleRegistrar:", err);
      setError("No se pudo registrar el usuario: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Registrar Usuario</h1>
      <form
        onSubmit={handleRegistrar}
        className="bg-white shadow-md p-6 rounded-lg grid gap-4"
      >
        <input
          type="text"
          placeholder="Nombre"
          value={nuevoUsuario.nombre}
          onChange={(e) =>
            setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })
          }
          required
          className="border p-2 rounded w-full"
        />
        <input
          type="email"
          placeholder="Email"
          value={nuevoUsuario.email}
          onChange={(e) =>
            setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })
          }
          required
          className="border p-2 rounded w-full"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={nuevoUsuario.password}
          onChange={(e) =>
            setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })
          }
          required
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          } w-full`}
        >
          {loading ? "Registrando..." : "Registrar"}
        </button>
      </form>
      {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
      {success && <p className="text-green-600 mt-4 text-center">{success}</p>}
    </div>
  );
}
 */

import { useState } from "react";

export default function CreateUserForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"empleado" | "master">("empleado");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/createUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Usuario creado: ${data.user.email}`);
        setEmail("");
        setPassword("");
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("❌ Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 bg-white shadow rounded-2xl space-y-4"
    >
      <h2 className="text-xl font-bold">Registrar nuevo usuario</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value as "empleado" | "master")}
        className="w-full p-2 border rounded"
      >
        <option value="empleado">Empleado</option>
        <option value="master">Master</option>
      </select>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Creando..." : "Crear Usuario"}
      </button>

      {message && <p className="text-center">{message}</p>}
    </form>
  );
}
