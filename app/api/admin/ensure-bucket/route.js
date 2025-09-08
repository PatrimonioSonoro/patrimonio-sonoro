import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  // Uses service role key to create bucket if missing. Must be set in env: SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 });
  }

  const supabaseAdmin = createClient(url, serviceKey, { global: { headers: { 'x-from-server': '1' } } });

  try {
    // Check if bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = (buckets || []).some(b => b.name === 'Contenido');
    const fileSizeLimit = 50 * 1024 * 1024; // 50 MB
    if (!exists) {
      const { data, error } = await supabaseAdmin.storage.createBucket('Contenido', { public: false, file_size_limit: fileSizeLimit });
      if (error) throw error;
      return NextResponse.json({ created: true, bucket: data }, { status: 201 });
    } else {
  // If bucket exists, do not attempt to modify storage settings here.
  // Some Supabase projects may reject updateBucket calls and cause 500 errors.
  // Keeping ensure-bucket idempotent and non-failing avoids blocking uploads.
    }
    return NextResponse.json({ created: false, message: 'Bucket exists' });
  } catch (e) {
    console.error('ensure-bucket error', e);
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}
