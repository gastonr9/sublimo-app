"use client";

import { useState } from "react";

export default function UsuariosPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error desconocido");

      setMessage("✅ Usuario creado con éxito");
      setEmail("");
      setPassword("");
      setRole("employee");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`❌ Error: ${err.message}`);
      } else {
        setMessage("❌ Error: Ocurrió un error desconocido.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border slot"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border slot"
            required
          />
        </div>

        <div>
          <label className="flex text-sm font-medium">Rol</label>
          <div className="px-4 py-2 flex gap-10 ">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border slot"
            >
              <option value="employee">employee</option>
              <option value="master">Master</option>
            </select>

            <button type="submit" disabled={loading} className="bg-green slot">
              <div className="text-white">
                {loading ? "Creando..." : "Crear Usuario"}
              </div>
            </button>
          </div>
        </div>
      </form>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
