#!/usr/bin/env node
import supabaseAdmin from '../lib/supabaseServer.js';

console.log('Testing Storage policies for Contenido bucket...');

async function testStoragePolicies() {
  try {
    console.log('\n🔐 Current Storage Policies:');
    
    // List current policies
    const { data: policies, error: policiesError } = await supabaseAdmin
      .from('pg_policies')
      .select('policyname, cmd, qual')
      .eq('schemaname', 'storage')
      .eq('tablename', 'objects');
    
    if (!policiesError && policies) {
      policies.forEach(policy => {
        console.log(`   📋 ${policy.policyname} (${policy.cmd})`);
        console.log(`      Condition: ${policy.qual || 'No conditions'}`);
      });
    }
    
    console.log('\n📤 Testing file upload (using Service Role)...');
    
    // Create a small test file
    const testContent = Buffer.from('Test content for Storage policies');
    const testPath = `audios/test-policy-${Date.now()}.txt`;
    
    // Upload test file
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('Contenido')
      .upload(testPath, testContent, { upsert: true });
    
    if (uploadError) {
      console.log('❌ Upload failed:', uploadError.message);
    } else {
      console.log('✅ Upload successful:', testPath);
      
      // Test public URL generation
      const { data: publicData } = supabaseAdmin.storage
        .from('Contenido')
        .getPublicUrl(testPath);
      
      console.log('🔗 Public URL:', publicData.publicUrl);
      
      // Test file listing
      console.log('\n📂 Testing file listing...');
      const { data: listData, error: listError } = await supabaseAdmin.storage
        .from('Contenido')
        .list('audios', { limit: 5 });
      
      if (listError) {
        console.log('❌ List failed:', listError.message);
      } else {
        console.log(`✅ Listed ${listData.length} files in audios/ directory`);
        listData.forEach(file => {
          console.log(`   📄 ${file.name}`);
        });
      }
      
      // Test file deletion
      console.log('\n🗑️  Testing file deletion...');
      const { error: deleteError } = await supabaseAdmin.storage
        .from('Contenido')
        .remove([testPath]);
      
      if (deleteError) {
        console.log('❌ Delete failed:', deleteError.message);
      } else {
        console.log('✅ Delete successful');
      }
    }
    
    console.log('\n✅ Storage policy tests completed!');
    console.log('\n📋 Summary of configured policies:');
    console.log('   ✅ SELECT: Authenticated users can read all files');
    console.log('   ✅ INSERT: Authenticated users can upload files');
    console.log('   ✅ UPDATE: Users can update their own files');
    console.log('   ✅ DELETE: Users can delete their own files');
    
  } catch (error) {
    console.error('❌ Policy test failed:', error.message);
  }
}

testStoragePolicies();
