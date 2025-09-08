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

export async function DELETE(req) {
  try {
    // Basic auth: require an Authorization: Bearer <access_token> header and check is_admin RPC
    const auth = req.headers.get('authorization');
    
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - Missing Bearer token' }, { status: 401 });
    }
    
    const token = auth.slice(7);
    const anonKey = getAnonKey();
    const url = getSupabaseUrl();
    const userClient = createClient(url, anonKey, { 
      global: { headers: { Authorization: `Bearer ${token}` } }, 
      auth: { persistSession: false } 
    });

    // Verify user authentication
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const uid = userData.user.id;

    // Check admin role
    const { data: isAdmin, error: adminError } = await userClient.rpc('is_admin', { uid });
    
    if (adminError) {
      return NextResponse.json({ error: `Admin check failed: ${adminError.message}` }, { status: 500 });
    }
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin role required' }, { status: 403 });
    }

    // Get file path from request body
    const body = await req.json();
    const { filePath } = body;

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    console.log('🗑️ Deleting file:', filePath);

    // Delete file from storage
    const { error: deleteError } = await supabaseAdmin.storage
      .from('Contenido')
      .remove([filePath]);

    if (deleteError) {
      console.log('❌ Error deleting file:', deleteError);
      return NextResponse.json({ error: `Failed to delete file: ${deleteError.message}` }, { status: 500 });
    }

    console.log('✅ File deleted successfully:', filePath);

    return NextResponse.json({ success: true, message: 'File deleted successfully' });

  } catch (error) {
    console.error('❌ Delete file error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
