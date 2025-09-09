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

export async function POST(req) {
  console.log('Admin upload route called');
  try {
    // Basic auth: require an Authorization: Bearer <access_token> header and check is_admin RPC
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - Missing Bearer token' }, { status: 401 });
    }
    
    const token = auth.slice(7);
  // token present

    const anonKey = getAnonKey();
    const url = getSupabaseUrl();
    const userClient = createClient(url, anonKey, { 
      global: { headers: { Authorization: `Bearer ${token}` } }, 
      auth: { persistSession: false } 
    });

  // get user data from token
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    
    if (userErr) {
      return NextResponse.json({ error: 'Unauthorized - invalid token' }, { status: 401 });
    }
    
    if (!userData?.user) {
      console.log('❌ No user data found');
      return NextResponse.json({ error: 'Invalid token - no user found' }, { status: 401 });
    }
    
    const uid = userData.user.id;
  // user authenticated

    // For storage operations, prefer admin client if available, otherwise use authenticated user client
    let storageClient = supabaseAdmin;
    if (!storageClient) {
      console.log('Admin client not available, using authenticated user client for storage operations');
      storageClient = userClient;
    }
  // user authenticated

    // check admin role via RPC (project has is_admin)
  // Check admin role via RPC
    let isAdmin = null;
    try {
      const { data: adminData, error: adminError } = await userClient.rpc('is_admin', { uid });
      if (adminError) {
        console.log('⚠️ Admin RPC returned error (treating as not admin):', adminError.message || adminError);
        // Treat RPC errors as non-admin to avoid 500 responses; return 403
        return NextResponse.json({ error: 'Forbidden - Admin check failed' }, { status: 403 });
      }
      isAdmin = adminData;
    } catch (rpcErr) {
      console.log('⚠️ Exception calling is_admin RPC (treating as not admin):', rpcErr.message || rpcErr);
      return NextResponse.json({ error: 'Forbidden - Admin check failed' }, { status: 403 });
    }

    if (!isAdmin) {
      console.log('❌ User is not admin according to RPC');
      return NextResponse.json({ error: 'Forbidden - Admin role required' }, { status: 403 });
    }

  // admin confirmed

  // parse request body

  // Support multipart/form-data (FormData) from browser or JSON fallback
  let title = null, description = null, region = null, status = 'draft', visible_to_user = true, publicly_visible = false;
    let files = {};

    try {
      // In Next.js route handlers, Request.formData() is available in many runtimes
      if (typeof req.formData === 'function') {
        const form = await req.formData();
  // Received FormData

        title = form.get('title') || null;
        description = form.get('description') || null;
        region = form.get('region') || null;
        status = form.get('status') || 'draft';
        const vis = form.get('visible_to_user');
        visible_to_user = vis === '1' || vis === 'true' || vis === true;
        const pub = form.get('publicly_visible');
        publicly_visible = pub === '1' || pub === 'true' || pub === true;

        // Check if this is an update operation
        const updateMode = form.get('update_mode') === 'true';
        const contentId = form.get('content_id');

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

        // If this is an update operation, return only the file paths
        if (updateMode && contentId) {
          // Update mode
          
          const uploadResults = {};
          
          if (files.audio) {
            const r = await uploadFile(files.audio, 'audios');
            if (r) uploadResults.audio_path = r.path;
          }
          
          if (files.image) {
            console.log('🖼️ Processing image file for update...');
            const r = await uploadFile(files.image, 'imagenes');
            if (r) uploadResults.image_path = r.path;
          }
          
          if (files.video) {
            const r = await uploadFile(files.video, 'videos');
            if (r) uploadResults.video_path = r.path;
          }
          return NextResponse.json(uploadResults, { status: 200 });
        }
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

  // files present

    const payload = {
      title: title || null,
      description: description || null,
      region: region || null,
      status,
      visible_to_user: true,  // Always make content visible to users
      publicly_visible: true, // Always make content publicly visible
      created_by: uid,
      updated_by: uid,
    };

  // initial payload prepared

  // helper to upload a base64/file buffer object { name, buffer }
  async function uploadFile(fileObj, folder) {
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

        const { data: uploadData, error: uploadErr } = await storageClient.storage.from('contenido').upload(path, buffer, { 
          upsert: true,
          contentType: fileObj.contentType || 'application/octet-stream'
        });

        if (uploadErr) {
          console.log(`❌ Upload error for ${path}:`, uploadErr);
          console.log('Upload error details:', JSON.stringify(uploadErr, null, 2));
          // Return null so caller can handle gracefully
          return null;
        }

        console.log(`✅ File uploaded successfully: ${path}`);

  // Do NOT generate or store a public URL. We keep paths private and
  // provide short-lived signed URLs from a server endpoint when needed.
  return { path };
      } catch (err) {
        console.log(`❌ Error in uploadFile for ${path}:`, err.message || err);
        return null;
      }
    };

  // processing uploads
    
    if (files.audio) {
      const r = await uploadFile(files.audio, 'audios');
      if (r) {
        // Generate the public URL directly since bucket is public
        const publicUrl = `${getSupabaseUrl()}/storage/v1/object/public/contenido/${r.path}`;
        payload.audio_public_url = publicUrl;
      }
    }
    
    if (files.image) {
      const r = await uploadFile(files.image, 'imagenes');
      if (r) {
        // Generate the public URL directly since bucket is public
        const publicUrl = `${getSupabaseUrl()}/storage/v1/object/public/contenido/${r.path}`;
        payload.image_public_url = publicUrl;
      }
    }
    
    if (files.video) {
      const r = await uploadFile(files.video, 'videos');
      if (r) {
        // Generate the public URL directly since bucket is public
        const publicUrl = `${getSupabaseUrl()}/storage/v1/object/public/contenido/${r.path}`;
        payload.video_public_url = publicUrl;
      }
    }

  // insert into contenidos
    // For database operations, prefer admin client if available, otherwise use authenticated user client
    let dbClient = supabaseAdmin || userClient;
    
    const { data: row, error: insertErr } = await dbClient.from('contenidos').insert(payload).select('id').single();
    
    if (insertErr) {
      console.error('DB insert error:', insertErr.message || insertErr);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ id: row.id, success: true }, { status: 201 });
  } catch (e) {
    console.error('Admin upload error:', e.message || e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
