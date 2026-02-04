import { createClient } from '@supabase/supabase-js';

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

const mockClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: {}, error: new Error("Modo Demo Activo") }),
    signOut: () => Promise.resolve()
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({ 
        single: () => Promise.resolve({ data: null, error: null }),
        order: () => Promise.resolve({ data: [], error: null }) 
      }),
      order: () => Promise.resolve({ data: [], error: null })
    }),
    insert: () => Promise.resolve({ error: null }),
    upsert: () => Promise.resolve({ error: null }),
    update: () => ({ eq: () => Promise.resolve({ error: null }) }),
    delete: () => ({ eq: () => Promise.resolve({ error: null }) })
  })
};

export const supabase = isSupabaseConfigured ? createClient(URL, KEY) : (mockClient as any);
