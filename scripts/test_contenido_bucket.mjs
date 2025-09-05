#!/usr/bin/env node
import supabaseAdmin from '../lib/supabaseServer.js';

console.log('Testing Contenido bucket functionality...');

async function testBucket() {
  try {
    // Test bucket listing
    console.log('\n1. Testing bucket listing...');
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    if (bucketsError) throw bucketsError;
    
    const contenidoBucket = buckets.find(b => b.name === 'Contenido');
    if (contenidoBucket) {
      console.log('✅ Bucket "Contenido" found:', contenidoBucket);
    } else {
      console.log('❌ Bucket "Contenido" not found');
      return;
    }

    // Test bucket contents
    console.log('\n2. Testing bucket contents...');
    const { data: files, error: filesError } = await supabaseAdmin.storage.from('Contenido').list('', { limit: 10 });
    if (filesError) throw filesError;
    
    console.log(`📁 Found ${files.length} items in bucket`);
    files.forEach(file => {
      console.log(`   - ${file.name} (${file.metadata?.size || 'unknown size'})`);
    });

    // Test public URL generation
    if (files.length > 0) {
      console.log('\n3. Testing public URL generation...');
      const testFile = files[0];
      const { data: publicData } = supabaseAdmin.storage.from('Contenido').getPublicUrl(testFile.name);
      if (publicData?.publicUrl) {
        console.log('✅ Public URL generated:', publicData.publicUrl);
      } else {
        console.log('❌ Failed to generate public URL');
      }
    }

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBucket();
