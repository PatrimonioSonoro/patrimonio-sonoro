import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const paths = Array.isArray(body.paths) ? body.paths : [];
    const expires = Math.max(30, Math.min(3600, parseInt(body.expires || '300'))); // 5 minutes default, max 1 hour

    if (!paths.length) {
      return NextResponse.json({ urls: {} }, { status: 200 });
    }

    const results = {};

    // Try with admin client first
    if (supabaseAdmin) {
      await Promise.all(paths.map(async (path) => {
        try {
          const { data, error } = await supabaseAdmin.storage.from('Contenido').createSignedUrl(path, expires);
          results[path] = error || !data?.signedUrl ? null : data.signedUrl;
        } catch (e) {
          results[path] = null;
        }
      }));
    } else {
      // Fallback: try with anonymous client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && anonKey) {
        const anonClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
        
        await Promise.all(paths.map(async (path) => {
          try {
            const { data, error } = await anonClient.storage.from('Contenido').createSignedUrl(path, expires);
            results[path] = error || !data?.signedUrl ? null : data.signedUrl;
          } catch (e) {
            results[path] = null;
          }
        }));
      } else {
        // No client available, return nulls
        paths.forEach(path => results[path] = null);
      }
    }

    return NextResponse.json({ urls: results });
  } catch (error) {
    console.error('Error generating public signed URLs:', error);
    return NextResponse.json({ error: 'Failed to generate URLs' }, { status: 500 });
  }
}
