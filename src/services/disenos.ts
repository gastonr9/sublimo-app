import { supabase } from "../lib/supabaseClient";

export interface Disenos {
  id: string;
  nombre: string;
  imagen_url: string;
  stock: number;
}

// Obtener todos los diseños
export const getDisenos = async (): Promise<Disenos[]> => {
  const { data, error } = await supabase.from("disenos").select("*");
  if (error) throw error;
  return data as Disenos[];
};

// Agregar un nuevo diseño
export const addDisenos = async (design: Omit<Disenos, "id">) => {
  const { data, error } = await supabase
    .from("disenos")
    .insert([design])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Actualizar stock o nombre de un diseño
export const updateDisenos = async (id: string, updates: Partial<Disenos>) => {
  const { error } = await supabase.from("disenos").update(updates).eq("id", id);
  if (error) throw error;
};

// Eliminar un diseño
export const deleteDisenos = async (id: string) => {
  const { error } = await supabase.from("disenos").delete().eq("id", id);
  if (error) throw error;
};

// Subir imagen al bucket "disenos"
export const uploadDisenosImage = async (file: File): Promise<string> => {
  const fileName = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from("disenos")
    .upload(fileName, file);

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from("disenos")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};
