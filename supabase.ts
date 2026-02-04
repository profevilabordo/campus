
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

/**
 * Función auxiliar para obtener variables de entorno de forma robusta.
 * Busca en process.env (estándar de la plataforma) y en import.meta.env (estándar de Vite).
 */
const getEnv = (key: string): string | undefined => {
  // 1. Intentar desde process.env
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // 2. Intentar desde import.meta.env
  if (typeof (import.meta as any).env !== 'undefined' && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  return undefined;
};

// Intentamos obtener la URL y la Key probando con y sin el prefijo VITE_
const supabaseUrl = 
  getEnv('VITE_SUPABASE_URL') || 
  getEnv('SUPABASE_URL') || 
  'https://your-project.supabase.co';

const supabaseAnonKey = 
  getEnv('VITE_SUPABASE_ANON_KEY') || 
  getEnv('SUPABASE_ANON_KEY') || 
  'your-anon-key';

// Verificación de seguridad: si los valores siguen siendo los marcadores de posición, emitimos un error claro.
if (supabaseUrl.includes('your-project') || supabaseAnonKey === 'your-anon-key') {
  console.error("⚠️ ERROR DE CONFIGURACIÓN: No se detectaron las variables de entorno de Supabase.");
  console.info("Asegúrate de haber configurado SUPABASE_URL y SUPABASE_ANON_KEY en tu dashboard (Vercel/Settings/Environment Variables).");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
