// designs.ts
import { supabase } from "../supabase/Client";

// Traer diseños de la tabla con sus metadatos
export const getDesigns = async () => {
  const { data, error } = await supabase
    .from("disenos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

// Insertar diseño si no existe
export const addDesignMeta = async (nombre: string, imagenUrl: string) => {
  const { data, error } = await supabase
    .from("disenos")
    .insert([{ nombre, imagen_url: imagenUrl, stock: 0, selected: false }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Actualizar nombre, stock o selected
export const updateDesign = async (
  id: string,
  fields: Partial<{ nombre: string; stock: number; selected: boolean }>
) => {
  const { data, error } = await supabase
    .from("disenos")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};
export const deleteDesign = async (id: string) => {
  const { error } = await supabase.from("disenos").delete().eq("id", id);
  if (error) throw error;
};
