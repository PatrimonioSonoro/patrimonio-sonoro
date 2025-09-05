#!/usr/bin/env node
import fetch from 'node-fetch';
import fs from 'fs';

// Script para probar la API de upload del admin
// Necesitas proporcionar un access_token válido de un usuario admin

const ACCESS_TOKEN = process.env.ADMIN_ACCESS_TOKEN;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

if (!ACCESS_TOKEN) {
  console.error('❌ Please set ADMIN_ACCESS_TOKEN environment variable');
  console.log('💡 Get it from Supabase dashboard > Auth > Users > [admin user] > Copy access token');
  process.exit(1);
}

async function testUpload() {
  try {
    console.log('🧪 Testing admin upload API...');
    
    // Create small test files
    const testAudio = Buffer.from('fake audio data').toString('base64');
    const testImage = Buffer.from('fake image data').toString('base64');
    
    const body = {
      title: 'Test Content from Script',
      description: 'This is a test content created via script',
      region: 'Test Region',
      status: 'draft',
      visible_to_user: false,
      files: {
        audio: {
          name: 'test-audio.mp3',
          data: testAudio
        },
        image: {
          name: 'test-image.jpg',
          data: testImage
        }
      }
    };
    
    console.log('📤 Sending request to:', `${API_URL}/api/admin/upload`);
    console.log('📋 Body keys:', Object.keys(body));
    console.log('📁 Files:', Object.keys(body.files));
    
    const response = await fetch(`${API_URL}/api/admin/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify(body)
    });
    
    console.log('📡 Response status:', response.status);
    
    const result = await response.json();
    console.log('📋 Response data:', result);
    
    if (response.ok) {
      console.log('✅ Upload successful! Content ID:', result.id);
    } else {
      console.log('❌ Upload failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUpload();
