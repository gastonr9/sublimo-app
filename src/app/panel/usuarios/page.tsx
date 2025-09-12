// src/app/panel/usuarios/page.tsx
"use client";
import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string | null;
  role: "empleado" | "master";
}

export default function CreateUserForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"empleado" | "master">("empleado");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [fetchError, setFetchError] = useState("");

  // Fetch users on mount and after creating a user
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/getUsers");
      const data = await res.json().catch(() => null);

      if (res.ok && data?.users) {
        setUsers(data.users);
        setFetchError("");
      } else {
        setFetchError(
          `❌ Error al cargar usuarios: ${data?.error || "Error desconocido"}`
        );
      }
    } catch (err) {
      setFetchError("❌ Error de red al cargar usuarios");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // Client-side validation
    if (!email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      setMessage("❌ Error: Ingrese un email válido");
      return;
    }
    if (password.length < 6) {
      setMessage("❌ Error: La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (!["empleado", "master"].includes(role)) {
      setMessage("❌ Error: Seleccione un rol válido");
      return;
    }

    try {
      const res = await fetch("/api/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.user) {
        setMessage(`✅ Usuario creado: ${data.user.email}`);
        setEmail("");
        setPassword("");
        await fetchUsers(); // Refresh user list
      } else {
        setMessage(`❌ Error: ${data?.error || "Error desconocido"}`);
      }
    } catch (err) {
      setMessage("❌ Error de red o servidor caído");
      console.error("Fetch error:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
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
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Crear Usuario
        </button>

        {message && <p className="text-center">{message}</p>}
      </form>

      {/* User List */}
      <div className="bg-white shadow rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-4">Usuarios Registrados</h2>
        {fetchError && <p className="text-center text-red-600">{fetchError}</p>}
        {users.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Email</th>
                <th className="border p-2 text-left">Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="border p-2">{user.email || "Sin email"}</td>
                  <td className="border p-2">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-600">
            No hay usuarios registrados
          </p>
        )}
      </div>
    </div>
  );
}
