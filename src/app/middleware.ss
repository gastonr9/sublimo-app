import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/app/supabase/server";

export async function middleware(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Proteger rutas que requieren autenticación
  if (pathname.startsWith("/burgon") || pathname.startsWith("/panel")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Restringir /panel/usuarios a solo master
    if (pathname.startsWith("/panel/usuarios")) {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || profile?.role !== "master") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/burgon/:path*", "/panel/:path*"],
};
