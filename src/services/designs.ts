import { supabase } from "../lib/supabaseClient";

export const getDesigns = async () => {
  const { data, error } = await supabase
    .from("disenos")
    .select("*")
    .order("created_at", { ascending: false }); // si tenés created_at
  if (error) throw error;
  return data;
};

export const addDesign = async (file: File) => {
  // 1. Subir archivo al bucket "designs"
  const filePath = `designs/${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("designs") // 👈 bucket llamado "designs"
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // 2. Obtener URL pública
  const { data: publicUrlData } = supabase.storage
    .from("designs")
    .getPublicUrl(filePath);

  const imagen_url = publicUrlData.publicUrl;
  const nombre = file.name.split(".")[0]; // usa el nombre del archivo sin extensión

  // 3. Insertar en tabla "disenos"
  const { data, error } = await supabase
    .from("disenos")
    .insert([{ nombre, imagen_url, stock: 0 }])
    .select()
    .single();

  if (error) throw error;
  return data;
};
