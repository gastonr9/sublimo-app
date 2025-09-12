import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use the Supabase Service Role Key for secure server-side operations
// This key bypasses Row Level Security. Keep it secret!
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();

    // 1. Create the user in Supabase auth using the admin client.
    // The 'on_auth_user_created' trigger will automatically create the profile with 'empleado' role.
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.error("Supabase create user error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const userId = data?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "El usuario no se creó correctamente en Auth." },
        { status: 500 }
      );
    }

    // 2. If the desired role is 'master', update the profile created by the trigger.
    if (role === "master") {
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ role: role })
        .eq("id", userId);

      if (profileError) {
        console.error("Supabase profile update error:", profileError.message);
        return NextResponse.json(
          { error: profileError.message },
          { status: 500 }
        );
      }
    }

    // Return a success response with the user data.
    return NextResponse.json(
      { user: { id: userId, email: data.user.email, role } },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Server error:", err.message || err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
