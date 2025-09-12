"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "@/app/supabase/Client";

interface User {
  id: string;
  email: string | null;
  role: "empleado" | "master" | "sin rol";
}

export default function CreateUserForm() {
  const { user, role, isAuthReady } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"empleado" | "master">(
    "empleado"
  );
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [fetchError, setFetchError] = useState("");
  const [loading, setLoading] = useState(false);

  // Obtener la lista de usuarios desde el backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("list_users_with_profiles");

      if (error) {
        throw new Error(error.message);
      }
      setUsers(data || []);
      setFetchError("");
    } catch (err: any) {
      setFetchError(`❌ Error al cargar usuarios: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthReady && role === "master") {
      fetchUsers();
    }
  }, [isAuthReady, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      setMessage("❌ Error: Ingrese un email válido");
      return;
    }
    if (password.length < 6) {
      setMessage("❌ Error: La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      const { data, error } = await supabase.rpc("create_new_user", {
        user_email: email,
        user_password: password,
      });

      if (error) {
        throw new Error(error.message);
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .update({ role: newUserRole })
        .eq("id", data[0].id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      setMessage(`✅ Usuario creado: ${email}`);
      setEmail("");
      setPassword("");
      await fetchUsers();
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message || "Error desconocido"}`);
      console.error("Fetch error:", err);
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      setLoading(true);
      try {
        const { error } = await supabase.rpc("delete_user", {
          user_id: userId,
        });
        if (error) {
          throw new Error(error.message);
        }
        setMessage(`✅ Usuario eliminado correctamente.`);
        fetchUsers();
      } catch (err: any) {
        setMessage(`❌ Error al eliminar: ${err.message}`);
        setLoading(false);
      }
    }
  };

  if (!isAuthReady || role !== "master") {
    return (
      <p className="text-center mt-8">
        Acceso denegado. Solo para el rol Master.
      </p>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      {/* Formulario de creación de usuario */}
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
          value={newUserRole}
          onChange={(e) =>
            setNewUserRole(e.target.value as "empleado" | "master")
          }
          className="w-full p-2 border rounded"
        >
          <option value="empleado">Empleado</option>
          <option value="master">Master</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear Usuario"}
        </button>
        {message && <p className="text-center">{message}</p>}
      </form>

      {/* Lista de usuarios */}
      <div className="bg-white shadow rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-4">Usuarios Registrados</h2>
        {fetchError && <p className="text-center text-red-600">{fetchError}</p>}
        {loading && (
          <p className="text-center text-gray-600">Cargando usuarios...</p>
        )}
        {users.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-left">Rol</th>
                <th className="border p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="border p-2">{u.email || "Sin email"}</td>
                  <td className="border p-2">{u.role}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                      disabled={loading}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !loading && (
            <p className="text-center text-gray-600">
              No hay usuarios registrados
            </p>
          )
        )}
      </div>
    </div>
  );
}
