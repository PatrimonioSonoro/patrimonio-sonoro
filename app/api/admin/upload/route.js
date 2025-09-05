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

export async function POST(req) {
  console.log('🚀 Admin upload route called');
  
  try {
    // Basic auth: require an Authorization: Bearer <access_token> header and check is_admin RPC
    const auth = req.headers.get('authorization');
    console.log('🔐 Authorization header present:', !!auth);
    
    if (!auth?.startsWith('Bearer ')) {
      console.log('❌ Missing or invalid Authorization header');
      return NextResponse.json({ error: 'Unauthorized - Missing Bearer token' }, { status: 401 });
    }
    
    const token = auth.slice(7);
    console.log('🎫 Token extracted, length:', token.length);

    const anonKey = getAnonKey();
    const url = getSupabaseUrl();
    const userClient = createClient(url, anonKey, { 
      global: { headers: { Authorization: `Bearer ${token}` } }, 
      auth: { persistSession: false } 
    });

    console.log('👤 Getting user data...');
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    
    if (userErr) {
      console.log('❌ User error:', userErr);
      return NextResponse.json({ error: `Auth error: ${userErr.message}` }, { status: 401 });
    }
    
    if (!userData?.user) {
      console.log('❌ No user data found');
      return NextResponse.json({ error: 'Invalid token - no user found' }, { status: 401 });
    }
    
    const uid = userData.user.id;
    console.log('✅ User authenticated:', uid);

    // check admin role via RPC (project has is_admin)
    console.log('🔒 Checking admin role...');
    const { data: isAdmin, error: adminError } = await userClient.rpc('is_admin', { uid });
    
    if (adminError) {
      console.log('❌ Admin check error:', adminError);
      return NextResponse.json({ error: `Admin check failed: ${adminError.message}` }, { status: 500 });
    }
    
    if (!isAdmin) {
      console.log('❌ User is not admin');
      return NextResponse.json({ error: 'Forbidden - Admin role required' }, { status: 403 });
    }
    
    console.log('✅ Admin role confirmed');

    console.log('📝 Parsing request body...');

  // Support multipart/form-data (FormData) from browser or JSON fallback
  let title = null, description = null, region = null, status = 'draft', visible_to_user = true, publicly_visible = false;
    let files = {};

    try {
      // In Next.js route handlers, Request.formData() is available in many runtimes
      if (typeof req.formData === 'function') {
        const form = await req.formData();
        console.log('📦 Received FormData with keys:', Array.from(form.keys()));

        title = form.get('title') || null;
        description = form.get('description') || null;
        region = form.get('region') || null;
        status = form.get('status') || 'draft';
  const vis = form.get('visible_to_user');
  visible_to_user = vis === '1' || vis === 'true' || vis === true;
  const pub = form.get('publicly_visible');
  publicly_visible = pub === '1' || pub === 'true' || pub === true;

        // Helper to read File-like entries
        const readFileEntry = async (entry) => {
          if (!entry) return null;
          try {
            // entry is a File object with arrayBuffer method in this environment
            const name = entry.name || 'file';
            const contentType = entry.type || 'application/octet-stream';
            const arrayBuffer = await entry.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return { name, buffer, contentType };
          } catch (err) {
            console.log('❌ Error reading FormData file entry:', err);
            return null;
          }
        };

        const audioEntry = form.get('audio');
        const imageEntry = form.get('image');
        const videoEntry = form.get('video');

        if (audioEntry && audioEntry.size) files.audio = await readFileEntry(audioEntry);
        if (imageEntry && imageEntry.size) files.image = await readFileEntry(imageEntry);
        if (videoEntry && videoEntry.size) files.video = await readFileEntry(videoEntry);
      } else {
        // Fallback to JSON body (legacy)
        const body = await req.json();
        console.log('📋 JSON body keys:', Object.keys(body || {}));
        title = body.title || null;
        description = body.description || null;
        region = body.region || null;
        status = body.status || 'draft';
  visible_to_user = body.visible_to_user ?? true;
  publicly_visible = body.publicly_visible ?? false;
        // files expected as { audio: { name, data }, image: {...}, video: {...} }
        files = body.files || {};
      }
    } catch (parseErr) {
      console.log('❌ Error parsing request body:', parseErr);
      throw parseErr;
    }

    console.log('📁 Files in request:', Object.keys(files));

    const payload = {
      title: title || null,
      description: description || null,
      region: region || null,
      status,
      visible_to_user,
  publicly_visible,
      created_by: uid,
      updated_by: uid,
    };

    console.log('💾 Initial payload:', payload);

    // helper to upload a base64 file object { name, data }
    const uploadFile = async (fileObj, folder) => {
      // fileObj may be either { name, data (base64) } from legacy JSON or { name, buffer } from FormData
      if (!fileObj) return null;
      const name = fileObj.name || 'file';
      console.log(`📤 Uploading ${name} to ${folder}/`);

      const ext = String(name).split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
      const path = `${folder}/${fileName}`;

      console.log(`📍 Upload path: ${path}`);

      try {
        let buffer;
        if (fileObj.buffer) {
          buffer = fileObj.buffer;
        } else if (fileObj.data) {
          buffer = Buffer.from(fileObj.data, 'base64');
        } else {
          console.log('❌ No binary data found in fileObj');
          return null;
        }

        console.log(`📊 Buffer size: ${buffer.length} bytes`);

        const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage.from('Contenido').upload(path, buffer, { 
          upsert: true,
          contentType: fileObj.contentType || 'application/octet-stream'
        });

        if (uploadErr) {
          console.log(`❌ Upload error for ${path}:`, uploadErr);
          console.log('Upload error details:', JSON.stringify(uploadErr, null, 2));
          throw new Error(`Storage upload failed: ${uploadErr.message || uploadErr.error || JSON.stringify(uploadErr)}`);
        }

        console.log(`✅ File uploaded successfully: ${path}`);

  // Do NOT generate or store a public URL. We keep paths private and
  // provide short-lived signed URLs from a server endpoint when needed.
  return { path };
      } catch (err) {
        console.log(`❌ Error in uploadFile for ${path}:`, err);
        throw err;
      }
    };

    console.log('📁 Processing file uploads...');
    
  if (files.audio) {
      console.log('🎵 Processing audio file...');
      const r = await uploadFile(files.audio, 'audios');
      if (r) {
        payload.audio_path = r.path;
        console.log('✅ Audio file processed');
      }
    }
    
  if (files.image) {
      console.log('🖼️ Processing image file...');
      const r = await uploadFile(files.image, 'imagenes');
      if (r) {
        payload.image_path = r.path;
    // image_public_url intentionally not set to avoid public access
        console.log('✅ Image file processed');
      }
    }
    
  if (files.video) {
      console.log('🎬 Processing video file...');
      const r = await uploadFile(files.video, 'videos');
      if (r) {
        payload.video_path = r.path;
    // video_public_url intentionally not set to avoid public access
        console.log('✅ Video file processed');
      }
    }

    console.log('💾 Final payload for DB:', payload);
    console.log('📝 Inserting into contenidos table...');
    
    const { data: row, error: insertErr } = await supabaseAdmin.from('contenidos').insert(payload).select('id').single();
    
    if (insertErr) {
      console.log('❌ Database insert error:', insertErr);
      throw insertErr;
    }
    
    console.log('✅ Content created with ID:', row.id);

    return NextResponse.json({ id: row.id, success: true }, { status: 201 });
  } catch (e) {
    console.error('❌ Admin upload error:', e);
    
    // Provide more detailed error information
    const errorMessage = e.message || String(e);
    const errorDetails = {
      error: errorMessage,
      type: e.name || 'Unknown Error',
      timestamp: new Date().toISOString()
    };
    
    console.error('📋 Error details:', errorDetails);
    
    return NextResponse.json(errorDetails, { status: 500 });
  }
}
