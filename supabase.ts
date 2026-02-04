
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

/**
 * Senior Architecture Pattern: Safe Variable Extraction
 * Intentamos obtener las variables de múltiples fuentes posibles (Vite, Process, Global).
 */
const getSafeEnv = (key: string): string => {
  if (typeof process !== 'undefined' && process.env?.[key]) return process.env[key] as string;
  // @ts-ignore - Soporte para entornos basados en Vite
  if (typeof import.meta !== 'undefined' && import.meta.env?.[`VITE_${key}`]) return import.meta.env[`VITE_${key}`];
  return '';
};

const URL = getSafeEnv('SUPABASE_URL');
const KEY = getSafeEnv('SUPABASE_ANON_KEY');

// Validamos estrictamente antes de llamar al constructor del SDK.
// Esto evita el error "supabaseUrl is required" que rompe la ejecución en Vercel.
export const isSupabaseConfigured = URL.length > 0 && URL.startsWith('http') && KEY.length > 0;

export const supabase = isSupabaseConfigured 
  ? createClient(URL, KEY)
  : null;

if (!isSupabaseConfigured) {
  console.warn("🛡️ Campus: Supabase no detectado o mal configurado. El sistema operará en Modo Local/Demo.");
}
