import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabaseAdmin } from "./supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido" });
    }

    const { email, password, role } = req.body;

    // ejemplo creando usuario en Supabase con service_role
    const supabaseAdmin = createClient(
      process.env.VITE_PUBLIC_SUPABASE_URL,
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { role },
    });

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json({ user: data.user });
  } catch (err) {
    console.error("Error en createUser:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
