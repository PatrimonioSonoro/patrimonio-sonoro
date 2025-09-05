import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import supabaseAdmin from '../../../../lib/supabaseServer';

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  return url;
}

function getAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return key;
}

// Helper to validate bearer token and ensure caller is a 'user'
async function assertIsUser(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return { ok: false, error: 'Missing bearer token' };
  const token = authHeader.slice(7);
  const client = createClient(getSupabaseUrl(), getAnonKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, detectSessionInUrl: false, autoRefreshToken: false },
  });

  const { data: userRes, error: userErr } = await client.auth.getUser();
  if (userErr || !userRes?.user) return { ok: false, error: 'Invalid token' };

  const uid = userRes.user.id;
  const { data: isUser, error: roleErr } = await client.rpc('is_user', { uid }).catch(() => ({ data: null, error: true }));
  if (roleErr || !isUser) return { ok: false, error: 'Forbidden' };
  return { ok: true, user: userRes.user };
}

export async function POST(req) {
  try {
    const auth = req.headers.get('authorization');
    const assert = await assertIsUser(auth);
    if (!assert.ok) return NextResponse.json({ error: assert.error }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const paths = Array.isArray(body.paths) ? body.paths : [];
    const expires = Math.max(60, Math.min(60 * 60 * 24, parseInt(body.expires || '3600'))); // 1 day max

    if (!paths.length) return NextResponse.json({ urls: {} }, { status: 200 });

    const out = {};
    await Promise.all(paths.map(async (p) => {
      try {
        const { data, error } = await supabaseAdmin.storage.from('Contenido').createSignedUrl(p, expires);
        if (!error && data?.signedUrl) out[p] = data.signedUrl;
        else out[p] = null;
      } catch (e) {
        out[p] = null;
      }
    }));

    return NextResponse.json({ urls: out }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
