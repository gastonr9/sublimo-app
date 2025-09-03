// src/components/CreateUserForm.tsx
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

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res = await fetch("/api/createUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
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
