
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

/**
 * IMPORTANTE PARA VITE/VERCEL:
 * Para que las variables de entorno sean visibles en el navegador, 
 * deben estar configuradas en Vercel con el prefijo VITE_
 * Ejemplo: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
 */

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Verificación de seguridad en consola del navegador
if (supabaseUrl.includes('your-project')) {
  console.error("ERROR DE CONFIGURACIÓN: No se detectaron las variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Verificá el dashboard de Vercel.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
