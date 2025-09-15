// storage.ts
import { supabase } from "../supabase/client";

// Listar imágenes desde el bucket "designs"
export const listDesignsFromStorage = async () => {
  const { data, error } = await supabase.storage
    .from("designs")
    .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });

  if (error) throw error;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL no está definido en el entorno");
  }

  return data.map((file) => ({
    name: file.name,
    url: `${supabaseUrl}/storage/v1/object/public/designs/${file.name}`,
  }));
};

// Subir imagen y crear registro en la tabla disenos
export const uploadDesign = async (file: File) => {
  // Extraer el nombre base sin extensión
  const nameWithoutExt = file.name.replace(/\.[^/.]+$/, ""); // Elimina la extensión (e.g., .png, .jpg)
  const fileName = `${Date.now()}-${nameWithoutExt}`; // Nombre único sin extensión

  const { error: uploadError } = await supabase.storage
    .from("designs")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  // Crear registro en la tabla disenos
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const imagenUrl = `${supabaseUrl}/storage/v1/object/public/designs/${fileName}`;
  const { data, error: insertError } = await supabase
    .from("disenos")
    .insert([{ nombre: nameWithoutExt, imagen_url: imagenUrl, stock: 0 }])
    .select()
    .single();

  if (insertError) throw insertError;

  return data;
};

export const removeDesignFromStorage = async (fileName: string) => {
  const { error } = await supabase.storage.from("designs").remove([fileName]);
  if (error) throw error;
};
