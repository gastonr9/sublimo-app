// src/app/services/usuarios.ts
"use server";

import { createClient } from "@/supabase/server";

interface Usuario {
  id: string;
  email: string;
  rol: string;
  creado_en: string;
}

// 🔹 Listar todos los usuarios
export async function getUsuarios(): Promise<Usuario[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .order("creado_en", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Usuario[];
}

// 🔹 Crear usuario (auth + tabla usuarios)
export async function crearUsuario(
  email: string,
  password: string,
  rol: string
) {
  const supabase = createClient();

  // Crear en auth con rol en metadata
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { rol },
  });

  if (error) throw new Error(error.message);
  return data.user;
}

// 🔹 Actualizar rol en tabla usuarios
export async function actualizarRol(id: string, nuevoRol: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("usuarios")
    .update({ rol: nuevoRol })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// 🔹 Eliminar usuario (borra en auth y cascada en tabla)
export async function eliminarUsuario(id: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) throw new Error(error.message);
  return { success: true };
}
