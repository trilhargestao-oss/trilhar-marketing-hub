import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Inicializa o Supabase apenas se as credenciais existirem, ou exporta um mock se não configurado
export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321', // mock value
  supabaseKey || 'placeholder'             // mock value
);

// Auxiliar para verificação visual ou dev se supabase está real
export const hasRealSupabase = supabaseUrl && supabaseUrl !== 'http://localhost:54321' && supabaseKey;
