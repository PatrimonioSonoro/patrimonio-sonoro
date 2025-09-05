#!/usr/bin/env node
// Backfill script: mark existing published contents as publicly_visible where visible_to_user is true
import supabaseAdmin from '../lib/supabaseServer.js';

async function run() {
  console.log('Starting backfill...');
  const { data, error } = await supabaseAdmin.from('contenidos').select('id,visible_to_user,publicly_visible,status').eq('status','published');
  if (error) {
    console.error('Error selecting contenidos:', error);
    process.exit(1);
  }

  const toUpdate = data.filter((r) => r.visible_to_user && !r.publicly_visible).map((r) => r.id);
  console.log('Will update', toUpdate.length, 'rows');
  if (!toUpdate.length) return console.log('Nothing to do');

  const chunks = [];
  for (let i = 0; i < toUpdate.length; i += 100) chunks.push(toUpdate.slice(i, i + 100));

  for (const chunk of chunks) {
    const { error: upErr } = await supabaseAdmin.from('contenidos').update({ publicly_visible: true }).in('id', chunk);
    if (upErr) console.error('Error updating chunk:', upErr);
  }

  console.log('Backfill complete');
}

run().catch((e) => { console.error(e); process.exit(1); });
