import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

const supabase = createClient(supabaseUrl, serviceRoleKey);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido" });
    }

    const { email, password } = req.body;
    console.log("createUser payload:", email); // 👈 log para ver si llega

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.error("Supabase error:", error.message);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ user: data });
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
