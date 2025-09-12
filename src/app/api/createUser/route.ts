import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();

    // Crear usuario en Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Verificar que data.user exista
    const userId = data?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "El usuario no se creó correctamente en Auth." },
        { status: 500 }
      );
    }

    // Insertar perfil en tabla profiles
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{ id: userId, role }]);

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { user: { id: userId, email: data.user.email, role } },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Server error:", err.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
