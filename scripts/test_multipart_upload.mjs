#!/usr/bin/env node

/**
 * Test script para verificar uploads multipart/form-data al endpoint admin
 * Crea archivos de prueba y los sube usando FormData
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Generar datos de prueba
function createTestFiles() {
  const testDir = path.join(__dirname, 'test_files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }

  // Audio de prueba (simulado como WAV header + datos) - hasta 50MB permitido
  const audioData = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.alloc(4), // file size
    Buffer.from('WAVEfmt ', 'ascii'),
    Buffer.alloc(5000, 0x42) // datos simulados más grandes para test
  ]);
  
  // Imagen de prueba (simulado como PNG header + datos)
  const imageData = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), // PNG signature
    Buffer.alloc(500, 0x33) // datos simulados
  ]);

  fs.writeFileSync(path.join(testDir, 'test_audio.wav'), audioData);
  fs.writeFileSync(path.join(testDir, 'test_image.png'), imageData);
  
  return {
    audio: path.join(testDir, 'test_audio.wav'),
    image: path.join(testDir, 'test_image.png'),
  };
}

async function testMultipartUpload() {
  console.log('🧪 Testing multipart/form-data upload...');
  
  try {
    // Crear archivos de prueba
    const files = createTestFiles();
    console.log('✅ Test files created');

    // Simular FormData (en Node.js necesitamos polyfill o usar form-data)
    const FormData = (await import('form-data')).default;
    
    const form = new FormData();
    form.append('title', 'Test Content - Multipart Upload');
    form.append('description', 'Prueba de subida con FormData');
    form.append('region', 'Test Region');
    form.append('status', 'draft');
    form.append('visible_to_user', '1');
    
    // Añadir archivos
    form.append('audio', fs.createReadStream(files.audio), {
      filename: 'test_audio.wav',
      contentType: 'audio/wav'
    });
    form.append('image', fs.createReadStream(files.image), {
      filename: 'test_image.png', 
      contentType: 'image/png'
    });

    console.log('📦 FormData prepared with files');

    // Para este test, necesitaríamos un token de admin válido
    // En un entorno real, obtendrías esto de Supabase auth
    console.log('⚠️  Test requires valid admin token');
    console.log('💡 To run full test:');
    console.log('   1. Login as admin in your app');
    console.log('   2. Get access_token from browser dev tools');
    console.log('   3. Set TOKEN=<your_token> environment variable');
    console.log('   4. Run: TOKEN=<token> node scripts/test_multipart_upload.mjs');
    
    const token = process.env.TOKEN;
    if (!token) {
      console.log('❌ No TOKEN environment variable found');
      return;
    }

    // Hacer request real
    const fetch = (await import('node-fetch')).default;
    
    console.log('📤 Sending multipart request...');
    const response = await fetch('http://localhost:3000/api/admin/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form
    });

    console.log(`📡 Response status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Upload successful!');
      console.log('📋 Response:', result);
    } else {
      const error = await response.text();
      console.log('❌ Upload failed:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testMultipartUpload().then(() => {
    console.log('🏁 Test completed');
  });
}

export { testMultipartUpload };
