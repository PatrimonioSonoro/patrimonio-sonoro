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

    // Fetch published contenidos visible to users, include media fields
    const selectFields = `id,title,description,region,created_at,
      audio_path,audio_public_url,
      image_path,image_public_url,
      video_path,video_public_url,
      visible_to_user,status`;

    let query = supabase.from('contenidos').select(selectFields).eq('status','published').eq('visible_to_user', true).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (q) {
      // simple ILIKE search on title/description
      query = supabase.from('contenidos').select(selectFields).ilike('title', `%${q}%`).or(`description.ilike.%${q}%`).eq('status','published').eq('visible_to_user', true).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    }
    const { data: contents, error: contentsErr } = await query;
    if (contentsErr) return NextResponse.json({ error: contentsErr.message }, { status: 500 });

    // Create admin client for generating public URLs
    const serviceKey = getServiceRoleKey();
    let adminClient = null;
    if (serviceKey) {
      adminClient = createClient(getSupabaseUrl(), serviceKey, { auth: { persistSession: false } });
    } else {
      console.warn('SUPABASE_SERVICE_ROLE_KEY not found; public URLs will not be generated.');
    }

    // Since the 'Contenido' bucket is public, we can use public URLs directly
    // No need for signed URLs with a public bucket
    const enhanced = (contents || []).map((c) => {
      const out = { ...c };
      
      // Generate public URLs for media paths
      if (adminClient && c.audio_path && !c.audio_public_url) {
        const { data: publicData } = adminClient.storage.from('Contenido').getPublicUrl(c.audio_path);
        if (publicData?.publicUrl) out.audio_public_url = publicData.publicUrl;
      }
      if (adminClient && c.image_path && !c.image_public_url) {
        const { data: publicData } = adminClient.storage.from('Contenido').getPublicUrl(c.image_path);
        if (publicData?.publicUrl) out.image_public_url = publicData.publicUrl;
      }
      if (adminClient && c.video_path && !c.video_public_url) {
        const { data: publicData } = adminClient.storage.from('Contenido').getPublicUrl(c.video_path);
        if (publicData?.publicUrl) out.video_public_url = publicData.publicUrl;
      }
      
      return out;
    });

    return NextResponse.json({ contents: enhanced || [] }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
