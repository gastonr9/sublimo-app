"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";

export default function TestRole() {
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      // 1️⃣ Obtener el usuario autenticado
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) {
        setError("No hay usuario autenticado");
        return;
      }

      const uid = userData.user.id;
      setUserId(uid);

      // 2️⃣ Consultar la tabla usuarios (RLS debe estar habilitado)
      const { data, error } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("id", uid)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setRole(data?.rol ?? null);
      }
    };

    fetchRole();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="font-bold mb-2">Prueba de Rol</h2>
      <p>
        <strong>User ID:</strong> {userId || "No autenticado"}
      </p>
      <p>
        <strong>Rol:</strong> {role || "Sin rol detectado"}
      </p>
      {error && <p className="text-red-500">Error: {error}</p>}
    </div>
  );
}
