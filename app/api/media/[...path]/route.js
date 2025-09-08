import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

export async function GET(req, { params }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service not available' }, { status: 503 });
    }
    
    const pathSegments = params.path;
    const filePath = pathSegments.join('/');
    
    console.log('🎯 Media request for path:', filePath);

    // Get user session for authentication
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = auth.slice(7);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const userClient = createClient(url, anonKey, { 
      global: { headers: { Authorization: `Bearer ${token}` } }, 
      auth: { persistSession: false } 
    });

    // Verify user is authenticated
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('✅ User authenticated:', userData.user.id);

    // Generate a signed URL that expires in 1 hour
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from('Contenido')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (signedUrlError) {
      console.log('❌ Error creating signed URL:', signedUrlError);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    console.log('✅ Signed URL created successfully');

    // Return the signed URL
    return NextResponse.json({ 
      url: signedUrlData.signedUrl,
      expires_in: 3600 
    });

  } catch (error) {
    console.error('❌ Media route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
