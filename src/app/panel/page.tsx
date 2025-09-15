import { redirect } from "next/navigation";
import { createClient } from "@/app/supabase/server";

export default async function PanelPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirigir a /login si no hay usuario autenticado
  if (!user) {
    redirect("/login");
  }

  // Verificar el rol del usuario
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Redirigir a / si el rol no es master ni employee o hay error
  if (error || (profile?.role !== "master" && profile?.role !== "employee")) {
    // Cambiado a "employee"
    redirect("/");
  }

  // Redirigir a /panel/inventario para usuarios autenticados con rol válido
  redirect("/panel/inventario");
}
