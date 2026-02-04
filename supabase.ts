
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Estas constantes asumen la existencia de variables de entorno o configuración del proyecto
const supabaseUrl = (window as any)._env_?.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = (window as any)._env_?.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
