import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function GET(req) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const token = auth.slice(7);

    const supabase = createClient(getSupabaseUrl(), getAnonKey(), {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, detectSessionInUrl: false, autoRefreshToken: false },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const uid = userData.user.id;

    // Use RPC is_user(uid) to check role
    const { data: isUser, error: isUserErr } = await supabase.rpc('is_user', { uid });
    if (isUserErr) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (!isUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Query params for pagination/search
    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(url.searchParams.get('limit') || '10'));
    const offset = (page - 1) * limit;

    // Fetch published contenidos, include public URL fields
    const selectFields = `id,title,description,region,created_at,
      audio_public_url,
      image_public_url,
      video_public_url,
      status`;

    let query = supabase.from('contenidos').select(selectFields).eq('status','published').order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (q) {
      // simple ILIKE search on title/description
      query = supabase.from('contenidos').select(selectFields).ilike('title', `%${q}%`).or(`description.ilike.%${q}%`).eq('status','published').order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    }
    const { data: contents, error: contentsErr } = await query;
    if (contentsErr) return NextResponse.json({ error: contentsErr.message }, { status: 500 });

    // Public URLs are already in the database, no need for signed URLs
    return NextResponse.json({ contents: contents || [] }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
