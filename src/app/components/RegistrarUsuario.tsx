import { useState } from "react";
import { supabase } from "../supabase/Client";

export default function CreateUserForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"empleado" | "master">("empleado");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json().catch(() => null); // ← evita crash si está vacío

      if (res.ok && data?.user) {
        setMessage(`✅ Usuario creado: ${data.user.email}`);
        setEmail("");
        setPassword("");
      } else {
        setMessage(`❌ Error: ${data?.error || "Error desconocido"}`);
      }
    } catch (err) {
      setMessage("❌ Error de red o servidor caído");
      console.error(err);
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
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Crear Usuario
      </button>

      {message && <p className="text-center">{message}</p>}
    </form>
  );
}
