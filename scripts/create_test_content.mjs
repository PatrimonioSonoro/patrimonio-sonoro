#!/usr/bin/env node
import supabaseAdmin from '../lib/supabaseServer.js';
import fs from 'fs';

// Script para crear contenido de prueba con archivos de muestra
// Usage: node scripts/create_test_content.mjs

console.log('Creating test content...');

async function createTestContent() {
  try {
    // Crear un archivo de audio de prueba (1 segundo de silencio en formato WAV)
    const silenceWav = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x24, 0x08, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45, 0x66, 0x6d, 0x74, 0x20,
      0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x02, 0x00, 0x22, 0x56, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00,
      0x04, 0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61, 0x00, 0x08, 0x00, 0x00
    ]);

    // Subir archivo de audio de prueba
    const audioPath = `audios/test-audio-${Date.now()}.wav`;
    console.log('📤 Uploading test audio to audios/ directory...');
    const { data: audioUpload, error: audioError } = await supabaseAdmin.storage
      .from('Contenido')
      .upload(audioPath, silenceWav, { upsert: true });
    
    if (audioError) throw audioError;
    console.log('✅ Audio uploaded:', audioPath);

    // Generar URL pública del audio
    const { data: audioPublicData } = supabaseAdmin.storage.from('Contenido').getPublicUrl(audioPath);
    const audioPublicUrl = audioPublicData?.publicUrl;

    // Crear registro en la base de datos
    const contentPayload = {
      title: 'Contenido de Prueba',
      description: 'Este es un contenido de prueba creado automáticamente para verificar el funcionamiento del bucket Contenido.',
      region: 'Prueba',
      status: 'published',
      visible_to_user: true,
      audio_path: audioPath,
      audio_public_url: audioPublicUrl,
      user_id: '00000000-0000-0000-0000-000000000000' // UUID de prueba
    };

    console.log('💾 Creating database record...');
    const { data: contentRecord, error: contentError } = await supabaseAdmin
      .from('contenidos')
      .insert(contentPayload)
      .select('id')
      .single();

    if (contentError) throw contentError;
    console.log('✅ Content record created with ID:', contentRecord.id);

    console.log('\n🎉 Test content created successfully!');
    console.log('📄 Content ID:', contentRecord.id);
    console.log('🔊 Audio URL:', audioPublicUrl);
    console.log('\nYou can now test the content in your user page.');

  } catch (error) {
    console.error('❌ Failed to create test content:', error.message);
  }
}

createTestContent();
