import { NextResponse } from "next/server";
import { supabase } from "@/app/supabase/Client";

export async function middleware(request: Request) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = new URL(request.url);

  // Protect /panel route for master users only
  if (pathname.startsWith("/panel")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Fetch role from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "master") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protect /generador and /burgon for authenticated users
  if (pathname.startsWith("/panel/usuarios")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Allow public routes (e.g., /, /login)
  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*", "/generador/:path*", "/burgon/:path*"],
};
