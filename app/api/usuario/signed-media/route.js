import { NextResponse } from 'next/server';
import supabaseAdmin from '../../../../lib/supabaseServer';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const paths = Array.isArray(body.paths) ? body.paths : [];
    const expires = Math.max(30, Math.min(60 * 60, parseInt(body.expires || '300'))); // 5 minutes default

    if (!paths.length) return NextResponse.json({ urls: {} }, { status: 200 });

    const out = {};

    await Promise.all(paths.map(async (p) => {
      try {
        // Only generate if the referenced content is published and publicly_visible
        // Assume p is in the form 'audios/xyz.mp3' or 'videos/..'
        const { data: check } = await supabaseAdmin.from('contenidos').select('id').or(`audio_path.eq.${p},video_path.eq.${p},image_path.eq.${p}`).eq('status','published').eq('publicly_visible', true).limit(1).maybeSingle();
        if (!check) { out[p] = null; return; }

        const { data, error } = await supabaseAdmin.storage.from('Contenido').createSignedUrl(p, expires);
        if (error || !data?.signedUrl) out[p] = null;
        else out[p] = data.signedUrl;
      } catch (e) { out[p] = null; }
    }));

    return NextResponse.json({ urls: out }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
