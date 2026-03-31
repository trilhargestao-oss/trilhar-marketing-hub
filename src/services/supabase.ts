import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// URL de fallback válida para evitar crash fatal na inicialização do bundle
const fallbackUrl = 'https://placeholder-project.supabase.co';
const fallbackKey = 'placeholder-key';

export const supabase = createClient(
  supabaseUrl && supabaseUrl.startsWith('http') ? supabaseUrl : fallbackUrl,
  supabaseKey || fallbackKey
);

export const hasRealSupabase = !!(supabaseUrl && supabaseUrl.startsWith('http') && supabaseKey);
