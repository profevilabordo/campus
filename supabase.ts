
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

/**
 * Función de extracción ultra-resiliente.
 * No asume la existencia de process ni import.meta.
 */
const getEnvValue = (key: string): string => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[`VITE_${key}`]) return import.meta.env[`VITE_${key}`];
    // @ts-ignore
    if (typeof window !== 'undefined' && window[`__ENV_${key}`]) return window[`__ENV_${key}`];
  } catch (e) {}
  return '';
};

const URL = getEnvValue('SUPABASE_URL');
const KEY = getEnvValue('SUPABASE_ANON_KEY');

export const isSupabaseConfigured = URL.length > 10 && KEY.length > 10;

// Cliente Mock para evitar crashes si Supabase no está configurado
const createMockClient = () => {
  const handler = {
    get: () => () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }), order: () => Promise.resolve({ data: [], error: null }) }), order: () => Promise.resolve({ data: [], error: null }) }),
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signOut: () => Promise.resolve(),
        signInWithPassword: () => Promise.resolve({ data: {}, error: null })
      }
    })
  };
  return new Proxy({}, handler);
};

export const supabase = isSupabaseConfigured 
  ? createClient(URL, KEY)
  : createMockClient() as any;
