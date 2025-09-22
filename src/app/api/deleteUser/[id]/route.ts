import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    // First delete from profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 400,
      });
    }

    // Then delete from auth.users (this requires admin privileges)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
      });
    }

    return new Response(
      JSON.stringify({ message: "Usuario eliminado exitosamente" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
