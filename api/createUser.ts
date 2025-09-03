import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "./supabaseAdmin";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    // Crear usuario en auth
    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error || !user?.user) {
      return res
        .status(400)
        .json({ error: error?.message || "No se pudo crear el usuario" });
    }

    // Insertar en profiles
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([{ id: user.user.id, role }]);

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    return res.status(200).json({ message: "Usuario creado", user: user.user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
