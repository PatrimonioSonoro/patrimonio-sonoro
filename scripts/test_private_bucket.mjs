#!/usr/bin/env node
import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local FIRST
const envPath = join(process.cwd(), '.env.local');
try {
  const envFile = readFileSync(envPath, 'utf8');
  const envVars = envFile.split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .reduce((acc, line) => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length) {
        acc[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
      return acc;
    }, {});
  
  Object.assign(process.env, envVars);
  console.log('✅ Environment variables loaded from .env.local');
} catch (error) {
  console.error('❌ Error loading .env.local:', error.message);
  process.exit(1);
}

// Verify key variables are loaded
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found');
  process.exit(1);
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

// Create admin client directly
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

console.log('🔒 Testing private bucket security...\n');

async function testPrivateBucket() {
  try {
    // 1. Verificar que el bucket es privado
    console.log('1. Checking bucket privacy...');
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    if (bucketsError) throw bucketsError;
    
    const contenidoBucket = buckets.find(b => b.name === 'Contenido');
    if (!contenidoBucket) {
      console.log('❌ Bucket "Contenido" not found');
      return;
    }
    
    if (contenidoBucket.public) {
      console.log('❌ Bucket is still public!');
      return;
    }
    console.log('✅ Bucket is private');

    // 2. Probar acceso con admin client (debe funcionar)
    console.log('\n2. Testing admin access...');
    const testPath = `test/private-test-${Date.now()}.mp3`;
    const testContent = Buffer.from('fake mp3 content for testing');
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('Contenido')
      .upload(testPath, testContent, { 
        upsert: true,
        contentType: 'audio/mpeg'
      });
    
    if (uploadError) {
      console.log('❌ Admin upload failed:', uploadError.message);
    } else {
      console.log('✅ Admin upload successful');
      
      // 3. Probar URLs firmadas (debe funcionar)
      console.log('\n3. Testing signed URL generation...');
      const { data: signedData, error: signedError } = await supabaseAdmin.storage
        .from('Contenido')
        .createSignedUrl(testPath, 3600);
      
      if (signedError || !signedData?.signedUrl) {
        console.log('❌ Signed URL generation failed:', signedError?.message);
      } else {
        console.log('✅ Signed URL generated:', signedData.signedUrl.substring(0, 80) + '...');
        
        // 4. Probar acceso a URL firmada
        console.log('\n4. Testing signed URL access...');
        try {
          const response = await fetch(signedData.signedUrl);
          if (response.ok) {
            const content = await response.arrayBuffer();
            if (content.byteLength === testContent.length) {
              console.log('✅ Signed URL access successful');
            } else {
              console.log('❌ Content mismatch');
            }
          } else {
            console.log('❌ Signed URL access failed:', response.status);
          }
        } catch (fetchError) {
          console.log('❌ Fetch error:', fetchError.message);
        }
      }
      
      // 5. Probar URLs públicas (debe fallar)
      console.log('\n5. Testing public URL access (should fail)...');
      const { data: publicData } = supabaseAdmin.storage
        .from('Contenido')
        .getPublicUrl(testPath);
      
      if (publicData?.publicUrl) {
        try {
          const response = await fetch(publicData.publicUrl);
          if (response.ok) {
            console.log('❌ Public URL access should have failed but succeeded!');
          } else {
            console.log('✅ Public URL access correctly failed:', response.status);
          }
        } catch (fetchError) {
          console.log('✅ Public URL access correctly failed (fetch error)');
        }
      }
      
      // 6. Limpiar archivo de prueba
      console.log('\n6. Cleaning up test file...');
      const { error: deleteError } = await supabaseAdmin.storage
        .from('Contenido')
        .remove([testPath]);
      
      if (deleteError) {
        console.log('⚠️ Cleanup failed:', deleteError.message);
      } else {
        console.log('✅ Test file cleaned up');
      }
    }

    // 7. Probar acceso sin autenticación con cliente anónimo
    console.log('\n7. Testing anonymous client access (should fail)...');
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );
    
    const { data: anonListData, error: anonListError } = await anonClient.storage
      .from('Contenido')
      .list('', { limit: 1 });
    
    if (anonListError) {
      console.log('✅ Anonymous list access correctly denied:', anonListError.message);
    } else {
      console.log('❌ Anonymous list access should have been denied but succeeded');
      console.log('   Data returned:', anonListData?.length || 0, 'items');
    }

    // 8. Probar descarga anónima (debe fallar)
    console.log('\n8. Testing anonymous download (should fail)...');
    const { data: anonDownloadData, error: anonDownloadError } = await anonClient.storage
      .from('Contenido')
      .download('test/any-file.mp3');
    
    if (anonDownloadError) {
      console.log('✅ Anonymous download correctly denied:', anonDownloadError.message);
    } else {
      console.log('❌ Anonymous download should have been denied but succeeded');
    }

    console.log('\n🎉 Private bucket security test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPrivateBucket();
