// storage.ts
import { supabase } from "../lib/supabaseClient";

// Listar imágenes desde el bucket "designs"
export const listDesignsFromStorage = async () => {
  const { data, error } = await supabase.storage
    .from("designs")
    .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });

  if (error) throw error;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("VITE_SUPABASE_URL no está definido en el entorno");
  }

  return data.map((file) => ({
    name: file.name,
    url: `${supabaseUrl}/storage/v1/object/public/designs/${file.name}`,
  }));
};

// Subir imagen y crear registro en la tabla disenos
export const uploadDesign = async (file: File) => {
  const fileName = `${Date.now()}-${file.name}`; // Nombre único con timestamp
  const { error: uploadError } = await supabase.storage
    .from("designs")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // Crear registro en la tabla disenos
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const imagenUrl = `${supabaseUrl}/storage/v1/object/public/designs/${fileName}`;
  const { data, error: insertError } = await supabase
    .from("disenos")
    .insert([{ nombre: file.name, imagen_url: imagenUrl, stock: 0 }])
    .select()
    .single();

  if (insertError) throw insertError;

  return data;
};