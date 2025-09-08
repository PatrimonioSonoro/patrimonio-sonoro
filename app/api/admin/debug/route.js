import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

// Simplified debug version of admin upload
export async function GET(req) {
  try {
    console.log('🧪 Debug endpoint called');
    
    // Check if supabaseAdmin is available
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 503 });
    }
    
    // Test basic connectivity
    const { data: buckets, error: bucketError } = await supabaseAdmin.storage.listBuckets();
    if (bucketError) {
      return NextResponse.json({ error: 'Storage connection failed', details: bucketError }, { status: 500 });
    }
    
    const { data: tables, error: tableError } = await supabaseAdmin.from('contenidos').select('count', { count: 'exact', head: true });
    if (tableError) {
      return NextResponse.json({ error: 'Database connection failed', details: tableError }, { status: 500 });
    }
    
    return NextResponse.json({ 
      status: 'OK',
      buckets: buckets.map(b => ({ name: b.name, public: b.public })),
      contenidos_count: tables?.count || 0,
      timestamp: new Date().toISOString()
    });
    
  } catch (e) {
    console.error('Debug endpoint error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
