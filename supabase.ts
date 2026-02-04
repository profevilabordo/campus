import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return (typeof process !== 'undefined' && process.env?.[key]) || 
           // @ts-ignore
           (typeof import.meta !== 'undefined' && import.meta.env?.[`VITE_${key}`]) || 
           "";
  } catch { return ""; }
};

const URL = getEnv('SUPABASE_URL');
const KEY = getEnv('SUPABASE_ANON_KEY');

export const isSupabaseConfigured = URL.length > 10 && KEY.length > 10;

// Mock simple para evitar errores de métodos indefinidos
const mock = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
    signOut: () => Promise.resolve()
  },
  from: () => ({
    select: () => ({ 
      eq: () => ({ single: () => Promise.resolve({ data: null }), order: () => Promise.resolve({ data: [] }) }),
      order: () => Promise.resolve({ data: [] })
    }),
    insert: () => Promise.resolve({ error: null }),
    upsert: () => Promise.resolve({ error: null }),
    delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    update: () => ({ eq: () => Promise.resolve({ error: null }) })
  })
};

export const supabase = isSupabaseConfigured ? createClient(URL, KEY) : (mock as any);
