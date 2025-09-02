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

function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // Do not throw here; signed URLs are optional. Return null if not configured.
  return key || null;
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

    // Fetch published contenidos visible to users
    let query = supabase.from('contenidos').select('id,title,description,region,created_at').eq('status','published').eq('visible_to_user', true).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (q) {
      // simple ILIKE search on title/description
      query = supabase.from('contenidos').select('id,title,description,region,created_at').ilike('title', `%${q}%`).or(`description.ilike.%${q}%`).eq('status','published').eq('visible_to_user', true).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    }
    const { data: contents, error: contentsErr } = await query;
    if (contentsErr) return NextResponse.json({ error: contentsErr.message }, { status: 500 });

    // Optionally generate signed URLs for private assets using service role
    const expires = Math.max(60, parseInt(url.searchParams.get('expires') || '3600'));
    const serviceKey = getServiceRoleKey();
    let adminClient = null;
    if (serviceKey) {
      adminClient = createClient(getSupabaseUrl(), serviceKey, { auth: { persistSession: false } });
    } else {
      // Service role not configured; skip signed URL generation.
      console.warn('SUPABASE_SERVICE_ROLE_KEY not found; signed URLs will not be generated.');
    }

    const enhanced = await Promise.all((contents || []).map(async (c) => {
      const out = { ...c };
      try {
        if (adminClient && c.audio_path && !c.audio_public_url) {
          const { data, error } = await adminClient.storage.from('contenido').createSignedUrl(c.audio_path, expires);
          if (!error && data?.signedUrl) out.audio_signed_url = data.signedUrl;
        }
      } catch (e) {
        console.warn('Failed to create signed url for audio:', e?.message || e);
      }
      try {
        if (adminClient && c.image_path && !c.image_public_url) {
          const { data, error } = await adminClient.storage.from('contenido').createSignedUrl(c.image_path, expires);
          if (!error && data?.signedUrl) out.image_signed_url = data.signedUrl;
        }
      } catch (e) {
        console.warn('Failed to create signed url for image:', e?.message || e);
      }
      try {
        if (adminClient && c.video_path && !c.video_public_url) {
          const { data, error } = await adminClient.storage.from('contenido').createSignedUrl(c.video_path, expires);
          if (!error && data?.signedUrl) out.video_signed_url = data.signedUrl;
        }
      } catch (e) {
        console.warn('Failed to create signed url for video:', e?.message || e);
      }
      return out;
    }));

    return NextResponse.json({ contents: enhanced || [] }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
