
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Accedemos a las variables de entorno inyectadas por el entorno de ejecución (Vercel/Vite)
// process.env es el estándar para acceder a secretos configurados en el dashboard
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

if (supabaseUrl === 'https://your-project.supabase.co') {
  console.warn("Advertencia: SUPABASE_URL no está configurada. Usando valor por defecto.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
