import { supabase } from "../lib/supabaseClient";

export interface Design {
  id: string;
  nombre: string;
  imagen_url: string;
  stock: number;
}

// Obtener todos los diseños
export const getDesigns = async (): Promise<Design[]> => {
  const { data, error } = await supabase.from("disenos").select("*");
  if (error) throw error;
  return data as Design[];
};

// Agregar un nuevo diseño
export const addDesign = async (design: Omit<Design, "id">) => {
  const { data, error } = await supabase
    .from("disenos")
    .insert([design])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Actualizar stock o nombre de un diseño
export const updateDesign = async (id: string, updates: Partial<Design>) => {
  const { error } = await supabase.from("disenos").update(updates).eq("id", id);
  if (error) throw error;
};

// Eliminar un diseño
export const deleteDesign = async (id: string) => {
  const { error } = await supabase.from("disenos").delete().eq("id", id);
  if (error) throw error;
};

// Subir imagen al bucket "designs"
export const uploadDesignImage = async (file: File): Promise<string> => {
  const fileName = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from("designs")
    .upload(fileName, file);

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from("designs")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};
