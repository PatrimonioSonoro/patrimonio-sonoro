#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key] = value;
  });
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.log('❌ Missing environment variables');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', !!url);
  console.log('   SUPABASE_SERVICE_ROLE_KEY:', !!serviceKey);
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function checkSetup() {
  console.log('🔍 Checking Supabase setup for media uploads...\n');

  try {
    // 1. Check buckets
    console.log('📦 Checking storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Error listing buckets:', bucketsError.message);
      return;
    }
    
    console.log('   Available buckets:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
    
    const contenidoBucket = buckets.find(b => b.name === 'Contenido');
    
    if (!contenidoBucket) {
      console.log('❌ Contenido bucket not found. Creating...');
      const { error: createError } = await supabase.storage.createBucket('Contenido', { public: false });
      if (createError) {
        console.log('❌ Failed to create bucket:', createError.message);
        return;
      }
      console.log('✅ Contenido bucket created successfully');
    } else {
      console.log(`✅ Contenido bucket exists (${contenidoBucket.public ? 'public' : 'private'})`);
    }

    // 2. Check folder structure
    console.log('\n📁 Checking folder structure...');
    const folders = ['audios', 'imagenes', 'videos'];
    
    for (const folder of folders) {
      const { data: files, error: listError } = await supabase.storage
        .from('Contenido')
        .list(folder, { limit: 1 });
      
      if (listError && listError.message.includes('not found')) {
        console.log(`   📁 ${folder}/ - will be created when first file is uploaded`);
      } else if (listError) {
        console.log(`   ❌ Error checking ${folder}/: ${listError.message}`);
      } else {
        console.log(`   ✅ ${folder}/ - exists (${files.length} files)`);
      }
    }

    // 3. Check database table
    console.log('\n🗄️ Checking contenidos table...');
    const { data: tableData, error: tableError } = await supabase
      .from('contenidos')
      .select('id, title, audio_path, image_path, video_path')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Error accessing contenidos table:', tableError.message);
    } else {
      console.log('✅ contenidos table accessible');
      if (tableData.length > 0) {
        console.log('   Sample columns found:', Object.keys(tableData[0]));
      }
    }

    // 4. Test file upload capability
    console.log('\n🧪 Testing file upload capability...');
      const testData = Buffer.from('RIFF....'); // small placeholder binary that resembles audio
      const testPath = `audios/test-${Date.now()}.mp3`;
    
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Contenido')
        .upload(testPath, testData, { upsert: true, contentType: 'audio/mpeg' });
    
    if (uploadError) {
      console.log('❌ Upload test failed:', uploadError.message);
    } else {
      console.log('✅ Upload test successful');
      
      // Clean up test file
  await supabase.storage.from('Contenido').remove([testPath]);
      console.log('✅ Test file cleaned up');
    }

    console.log('\n🎉 Setup check complete!');
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

checkSetup();
