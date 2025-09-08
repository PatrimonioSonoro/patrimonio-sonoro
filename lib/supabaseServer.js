import { createClient } from '@supabase/supabase-js';

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  return url;
}

function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    // During build time or when not configured, return null to avoid errors
    return null;
  }
  return key;
}

// Server-side Supabase client using the Service Role key. Use only in server
// routes where you need elevated privileges (signed URLs, admin actions).
// Will be null if service role key is not available.
const serviceRoleKey = getServiceRoleKey();
export const supabaseAdmin = serviceRoleKey ? createClient(getSupabaseUrl(), serviceRoleKey, {
  auth: { persistSession: false },
  global: { headers: { 'x-from-server': '1' } },
}) : null;

export default supabaseAdmin;
