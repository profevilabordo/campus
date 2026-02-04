
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

/**
 * Acceso robusto a variables de entorno.
 * En este entorno, process.env es la fuente principal de configuración.
 */
const SUPABASE_URL = 
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  (import.meta as any).env?.VITE_SUPABASE_URL || 
  '';

const SUPABASE_ANON_KEY = 
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) || 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
  '';

// Exportamos el cliente configurado. 
// Si las variables no están presentes en el dashboard, Supabase devolverá un error 
// de red descriptivo al intentar realizar una petición.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
