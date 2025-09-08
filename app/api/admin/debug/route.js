import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

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

// Simplified debug version of admin upload
export async function GET(req) {
  try {
    console.log('🧪 Debug endpoint called');
    
    // Use admin client if available, otherwise fallback to anonymous client
    let supabase = supabaseAdmin;
    let usingFallback = false;
    if (!supabase) {
      console.log('Admin client not available, using anonymous client as fallback');
      supabase = createClient(getSupabaseUrl(), getAnonKey());
      usingFallback = true;
    }
    
    // Test basic connectivity
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      return NextResponse.json({ error: 'Storage connection failed', details: bucketError }, { status: 500 });
    }
    
    const { data: tables, error: tableError } = await supabase.from('contenidos').select('count', { count: 'exact', head: true });
    if (tableError) {
      return NextResponse.json({ error: 'Database connection failed', details: tableError }, { status: 500 });
    }
    
    return NextResponse.json({ 
      status: 'OK',
      usingFallback,
      buckets: buckets.map(b => ({ name: b.name, public: b.public })),
      contenidos_count: tables?.count || 0,
      timestamp: new Date().toISOString()
    });
    
  } catch (e) {
    console.error('Debug endpoint error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
