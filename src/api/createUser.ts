// /api/createUser.ts
import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY! as string;
const supabase = createClient(supabaseUrl, supabaseKey);
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No autorizado" });

  // Creamos un cliente con el token del usuario autenticado
  const userClient = createClient(process.env.VITE_SSUPABASE_URL!, token);

  // Verificamos rol
  const {
    data: { user },
  } = await userClient.auth.getUser();

  if (!user) return res.status(401).json({ error: "Usuario no válido" });

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError)
    return res.status(500).json({ error: "Error leyendo perfil" });
  if (profile?.role !== "master")
    return res
      .status(403)
      .json({ error: "Acceso denegado. Solo master puede crear usuarios." });

  // Si llegó acá, es master
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: "Faltan campos" });
  }

  try {
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) throw error;

    await supabase.from("profiles").insert({
      id: newUser.user.id,
      role,
    });

    return res.status(200).json({ success: true, user: newUser.user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
