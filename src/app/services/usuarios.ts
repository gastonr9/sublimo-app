import { supabase } from "../../supabase/client";
import { UserProfile } from "../types";

// =========================
// Perfiles de Usuario (tabla 'profiles')
// =========================

// Obtener todos los perfiles
export const getPerfiles = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase.from("profiles").select("id, role"); // Se elimina la columna 'email' de la consulta para resolver el error.

  if (error) {
    console.error("Error al obtener perfiles:", error.message);
    throw error;
  }
  return data as UserProfile[];
};

// Obtener un perfil por su ID
export const getPerfilPorId = async (
  id: string
): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role") // Se elimina la columna 'email' de la consulta.
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      console.warn(`Perfil con ID ${id} no encontrado.`);
      return null;
    }
    console.error(`Error al obtener perfil ${id}:`, error.message);
    throw error;
  }
  return data as UserProfile;
};

// Actualizar el perfil de un usuario existente
export const updatePerfil = async (
  id: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Error al actualizar perfil:", error.message);
    throw error;
  }
};

// Eliminar el perfil de un usuario
export const deletePerfil = async (id: string): Promise<void> => {
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) {
    console.error("Error al eliminar perfil:", error.message);
    throw error;
  }
};

// Función para obtener el rol de un usuario
export const getRolUsuario = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error al obtener el rol del usuario:", error.message);
    return null;
  }

  return data?.role || null;
};
