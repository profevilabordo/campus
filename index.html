
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

/**
 * Extracción de variables de entorno ultra-segura para producción.
 * Evita el uso directo de 'process' que puede romper el hilo de ejecución.
 */
const env = {
  URL: '',
  KEY: ''
};

try {
  // @ts-ignore - Intento via Vite/Vercel standard
  env.URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || "";
  // @ts-ignore
  env.KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || "";

  // Intento via global window (algunos inyectores de Vercel)
  if (!env.URL && typeof window !== 'undefined') {
    // @ts-ignore
    env.URL = window._env_?.SUPABASE_URL || "";
    // @ts-ignore
    env.KEY = window._env_?.SUPABASE_ANON_KEY || "";
  }
} catch (e) {
  console.warn("🛡️ Supabase: Error silencioso al leer env vars.");
}

export const isSupabaseConfigured = env.URL.length > 5 && env.KEY.length > 5;

/**
 * Senior Resiliency Pattern: 
 * Si no hay Supabase, exportamos un cliente "ficticio" (NoOp) 
 * para que App.tsx no rompa al intentar llamar a métodos.
 */
const mockClient = new Proxy({}, {
  get: () => () => ({
    select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }), order: () => Promise.resolve({ data: [], error: null }) }), order: () => Promise.resolve({ data: [], error: null }) }),
    insert: () => Promise.resolve({ data: null, error: null }),
    upsert: () => Promise.resolve({ data: null, error: null }),
    update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: () => Promise.resolve(),
      signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
      signUp: () => Promise.resolve({ data: {}, error: null })
    }
  })
});

export const supabase = isSupabaseConfigured 
  ? createClient(env.URL, env.KEY)
  : mockClient as any;
