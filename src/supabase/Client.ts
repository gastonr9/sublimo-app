import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY! as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Faltan variables de entorno: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
