import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";

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
    .from("usuarios")
    .select("rol")
    .eq("id", user.id)
    .single();

  // Redirigir a / si el rol no es admin ni empleado o hay error
  if (error || (profile?.rol !== "admin" && profile?.rol !== "empleado")) {
    // Cambiado a "empleado"
    redirect("/");
  }

  // Redirigir a /panel/inventario para usuarios autenticados con rol válido
  redirect("/panel/inventario");
}
