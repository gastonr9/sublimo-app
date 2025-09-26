import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

// GET: listar todos los usuarios (con join auth y tabla usuarios si quieres)
export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase.from("usuarios").select("*");

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST: crear usuario en auth y en tabla usuarios
export async function POST(req: Request) {
  const supabase = createClient();
  const body = await req.json();
  const { email, password, rol } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Faltan email y password" },
      { status: 400 }
    );
  }

  // 1. Crear usuario en Auth
  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  // 2. Insertar en tabla usuarios
  const { data, error } = await supabase
    .from("usuarios")
    .insert([
      {
        id: authUser.user.id,
        email: authUser.user.email,
        rol: rol || "empleado",
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
