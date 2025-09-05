#!/usr/bin/env node
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

// Usage: set NEXT_PUBLIC_SUPABASE_URL and ANON key and run
// node scripts/admin_upload_test.mjs <token-file> <file-to-upload>

const [,, tokenFile, uploadFile] = process.argv;
if (!tokenFile || !uploadFile) {
  console.error('Usage: node scripts/admin_upload_test.mjs <token-file> <file-to-upload>');
  process.exit(1);
}

const token = fs.readFileSync(tokenFile, 'utf8').trim();
const buf = fs.readFileSync(uploadFile);
const b64 = buf.toString('base64');
const name = path.basename(uploadFile);

const body = {
  title: 'Test upload',
  description: 'Upload test',
  region: 'test',
  status: 'published',
  visible_to_user: true,
  files: { audio: { name, data: b64 } }
};

(async () => {
  const res = await fetch('http://localhost:3000/api/admin/upload', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
  const json = await res.json();
  console.log(res.status, json);
})();
