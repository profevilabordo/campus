
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

/**
 * Acceso robusto y seguro a variables de entorno.
 * Si las variables no existen, evitamos que el SDK lance un Uncaught Error.
 */
const SUPABASE_URL = 
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  '';

const SUPABASE_ANON_KEY = 
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) || 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  '';

// Solo inicializamos si tenemos los datos mínimos. 
// Si no, exportamos null para que la App active el 'Demo Mode'.
export const isSupabaseConfigured = SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';

export const supabase = isSupabaseConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null as any; // Cast controlado para evitar errores de tipo en tiempo de compilación
