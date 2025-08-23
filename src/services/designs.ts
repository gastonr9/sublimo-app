// services/designs.ts
import { supabase } from "../lib/supabaseClient";

export const getDesigns = async () => {
  const { data, error } = await supabase
    .from("disenos")
    .select("*");
  if (error) throw error;
  return data;
};

export const getAvailableDesigns = async () => {
  const { data, error } = await supabase
    .from("disenos")
    .select("*")
    .gt("stock", 0);   // solo diseños con stock > 0
  if (error) throw error;
  return data;
};

export async function addDesign(file: File) {
  const fileName = `${Date.now()}_${file.name}`;

  // 1. Subir a Storage
  const { error: storageError } = await supabase.storage
    .from("designs")
    .upload(fileName, file);
  if (storageError) throw storageError;

  // 2. Obtener URL pública
  const { data: publicUrlData } = supabase.storage
    .from("designs")
    .getPublicUrl(fileName);

  // 3. Insertar en la tabla
  const { data, error } = await supabase
    .from("disenos")
    .insert([
      {
        nombre: file.name,
        imagen_url: publicUrlData.publicUrl,
        stock: 0,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}
