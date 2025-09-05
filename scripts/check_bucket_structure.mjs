#!/usr/bin/env node
import supabaseAdmin from '../lib/supabaseServer.js';

console.log('Checking Contenido bucket directory structure...');

async function checkBucketStructure() {
  try {
    console.log('\n📁 Bucket Structure:');
    
    // List main directories
    const { data: rootFiles, error: rootError } = await supabaseAdmin.storage
      .from('Contenido')
      .list('', { limit: 100 });
    
    if (rootError) throw rootError;
    
    // Separate files and folders
    const directories = rootFiles.filter(item => !item.name.includes('.'));
    const files = rootFiles.filter(item => item.name.includes('.'));
    
    console.log('\n🗂️  Directories:');
    if (directories.length === 0) {
      console.log('   No directories found. Will be created when first file is uploaded.');
    } else {
      for (const dir of directories) {
        console.log(`   📂 ${dir.name}/`);
        
        // List files in each directory
        const { data: dirFiles, error: dirError } = await supabaseAdmin.storage
          .from('Contenido')
          .list(dir.name, { limit: 10 });
        
        if (!dirError && dirFiles) {
          dirFiles.forEach(file => {
            if (file.name) {
              console.log(`      📄 ${file.name} (${file.metadata?.size ? Math.round(file.metadata.size / 1024) + 'KB' : 'unknown size'})`);
            }
          });
          if (dirFiles.length === 0) {
            console.log('      (empty)');
          }
        }
      }
    }
    
    console.log('\n📄 Root Files:');
    if (files.length === 0) {
      console.log('   No files in root directory.');
    } else {
      files.forEach(file => {
        console.log(`   📄 ${file.name} (${file.metadata?.size ? Math.round(file.metadata.size / 1024) + 'KB' : 'unknown size'})`);
      });
    }
    
    // Expected structure
    console.log('\n✅ Expected structure:');
    console.log('   📂 audios/     - Audio files (.mp3, .wav, .m4a, etc.)');
    console.log('   📂 imagenes/   - Image files (.jpg, .png, .gif, etc.)');
    console.log('   📂 videos/     - Video files (.mp4, .webm, .mov, etc.)');
    
    // Test public URL generation for each directory type
    console.log('\n🔗 Testing public URL generation:');
    const testCases = [
      { dir: 'audios', file: 'test.mp3' },
      { dir: 'imagenes', file: 'test.jpg' },
      { dir: 'videos', file: 'test.mp4' }
    ];
    
    testCases.forEach(test => {
      const { data: publicData } = supabaseAdmin.storage
        .from('Contenido')
        .getPublicUrl(`${test.dir}/${test.file}`);
      console.log(`   ${test.dir}/${test.file} → ${publicData.publicUrl}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking bucket structure:', error.message);
  }
}

checkBucketStructure();
