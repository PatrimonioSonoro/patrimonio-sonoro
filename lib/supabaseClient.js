"use client";
import { createClient } from '@supabase/supabase-js';

// Lee variables de entorno en tiempo de ejecución (NEXT_PUBLIC_... deben estar en .env)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  const msg =
    'Configuración de Supabase faltante: define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local';
  // Mensaje visible en navegador y consola para DX
  if (typeof window !== 'undefined') {
    // Evita romper UI silenciosamente: informa y lanza error
    console.error(msg);
    // Opcional: advertir al usuario final una sola vez
  }
  throw new Error(msg);
}

// Safe storage implementation that works during SSR
const createSafeStorage = () => {
  if (typeof window === 'undefined') {
    // Mock storage for SSR
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return window.localStorage;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { 
    persistSession: true, 
    detectSessionInUrl: true,
    autoRefreshToken: true,
    storage: createSafeStorage(),
    storageKey: 'sb-qnwhhslrsigfnqtfvmkz-auth-token',
    flowType: 'pkce'
  },
});

export default supabase;
