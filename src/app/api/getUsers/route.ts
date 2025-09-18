// /api/getUsers/route.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role")
      .order("role", { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({ users: data }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
