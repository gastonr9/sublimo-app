import { supabase } from "../lib/supabaseClient";

// Obtener imágenes cargadas en storage (contenedor)
export const getStorageDesigns = async () => {
  const { data, error } = await supabase.storage.from("designs").list("", {
    limit: 100,
    offset: 0,
  });

  if (error) throw error;

  // Normalizamos cada archivo con su URL pública
  return data.map((file) => {
    const { data: publicUrlData } = supabase.storage
      .from("designs")
      .getPublicUrl(file.name);

    return {
      name: file.name,
      url: publicUrlData.publicUrl,
    };
  });
};

// Obtener diseños en stock (tabla)
export const getDesigns = async () => {
  const { data, error } = await supabase
    .from("disenos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

// Agregar imagen a Storage
export const uploadToStorage = async (file: File) => {
  const fileName = `${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from("designs").upload(fileName, file);
  if (error) throw error;

  const { data: publicUrlData } = supabase.storage.from("designs").getPublicUrl(fileName);
  return { fileName, url: publicUrlData.publicUrl };
};

// Insertar en tabla disenos
export const addToStock = async (fileName: string, url: string) => {
  const { data, error } = await supabase
    .from("disenos")
    .insert([{ nombre: fileName, imagen_url: url, stock: 0 }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Actualizar stock o nombre
export const updateDesign = async (id: string, updates: Partial<{ nombre: string; stock: number }>) => {
  const { error } = await supabase.from("disenos").update(updates).eq("id", id);
  if (error) throw error;
  return true;
};

// Quitar solo de tabla
export const removeFromStock = async (id: string) => {
  const { error } = await supabase.from("disenos").delete().eq("id", id);
  if (error) throw error;
  return true;
};
