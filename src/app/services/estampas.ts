// estampas.ts
import { supabase } from "../../supabase/client";

// Traer estampas de la tabla con sus metadatos
export const getEstampas = async () => {
  const { data, error } = await supabase
    .from("estampas")
    .select("*")
    .order("creado_en", { ascending: false });
  if (error) throw error;
  return data;
};

// Insertar estampa si no existe
export const addEstampasMeta = async (nombre: string, imagenUrl: string) => {
  const { data, error } = await supabase
    .from("estampas")
    .insert([{ nombre, imagen_url: imagenUrl, stock: 0, disponible: false }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Actualizar nombre, stock o disponible
export const updateEstampas = async (
  id: string,
  fields: Partial<{ nombre: string; stock: number; disponible: boolean }>
) => {
  const { data, error } = await supabase
    .from("estampas")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};
export const deleteEstampas = async (id: string) => {
  const { error } = await supabase.from("estampas").delete().eq("id", id);
  if (error) throw error;
};
export async function listestampasFromStorage() {
  const { data, error } = await supabase.storage.from("designs").list("", {
    limit: 100,
    sortBy: { column: "name", order: "asc" }, // ✅ permitido
  });

  if (error) throw error;

  return data.map((file) => ({
    name: file.name,
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/designs/${file.name}`,
  }));
}
