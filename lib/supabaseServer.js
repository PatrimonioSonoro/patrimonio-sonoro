import { createClient } from '@supabase/supabase-js';

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  return url;
}

function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in server env');
  return key;
}

// Server-side Supabase client using the Service Role key. Use only in server
// routes where you need elevated privileges (signed URLs, admin actions).
export const supabaseAdmin = createClient(getSupabaseUrl(), getServiceRoleKey(), {
  auth: { persistSession: false },
  global: { headers: { 'x-from-server': '1' } },
});

export default supabaseAdmin;
