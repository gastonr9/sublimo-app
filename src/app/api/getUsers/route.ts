// /api/getUsers/route.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // First get profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, role")
      .order("role", { ascending: false });

    if (profilesError) {
      return new Response(JSON.stringify({ error: profilesError.message }), {
        status: 400,
      });
    }

    // Then get emails for each user
    const usersWithEmails = await Promise.all(
      profiles.map(async (profile) => {
        const { data: authUser, error: authError } =
          await supabase.auth.admin.getUserById(profile.id);

        return {
          id: profile.id,
          role: profile.role,
          email: authError ? null : authUser.user?.email || null,
        };
      })
    );

    const data = usersWithEmails;
    const error = null;

    // No error handling needed here since we constructed the data ourselves

    return new Response(JSON.stringify({ users: data }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
