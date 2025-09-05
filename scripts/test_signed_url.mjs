import supabaseAdmin from '../lib/supabaseServer.js';

async function run() {
  try {
    console.log('Listing objects in bucket "contenido" (first 50)');
    const { data, error } = await supabaseAdmin.storage.from('Contenido').list('', { limit: 50 });
    if (error) {
      console.error('List error:', error);
      process.exit(2);
    }
    if (!data || !data.length) {
      console.log('No objects found in bucket contenido');
      process.exit(0);
    }
    console.log(`Found ${data.length} objects. Showing first 10:`);
    data.slice(0, 10).forEach((d, i) => console.log(i + 1, d.name, d.metadata || ''));

    // Find first file with audio extension. If top-level entries are folders,
    // attempt to list inside them to find real files.
    const audioRegex = /\.(mp3|wav|m4a|ogg|aac)$/i;
    let target = null;
    // Check top-level for files
    const topFile = data.find(d => audioRegex.test(d.name));
    if (topFile) {
      target = topFile.name;
    } else {
      // Try listing inside each directory entry to find files
      for (const entry of data) {
        try {
          const { data: inner, error: innerErr } = await supabaseAdmin.storage.from('Contenido').list(entry.name, { limit: 100 });
          if (innerErr) continue;
          if (inner && inner.length) {
            const f = inner.find(i => audioRegex.test(i.name));
            if (f) {
              target = `${entry.name}/${f.name}`;
              break;
            }
            // if no audio, maybe pick first file
            const anyFile = inner.find(i => i.name && !i.name.endsWith('/'));
            if (anyFile && !target) {
              target = `${entry.name}/${anyFile.name}`;
            }
          }
        } catch (e) {
          // ignore
        }
      }
    }
    if (!target) {
      console.log('No file found in bucket contenido to test.');
      process.exit(0);
    }
    console.log('Creating signed URL for:', target);
    const { data: urlData, error: urlErr } = await supabaseAdmin.storage.from('Contenido').createSignedUrl(target, 3600);
    if (urlErr || !urlData?.signedUrl) {
      console.error('Failed to create signed URL', urlErr);
      process.exit(3);
    }
    console.log('Signed URL:', urlData.signedUrl);

    // Try to fetch head and range
    console.log('Fetching signed URL (HEAD) to inspect headers...');
    const headRes = await fetch(urlData.signedUrl, { method: 'HEAD' });
    console.log('HEAD status:', headRes.status);
    for (const h of ['content-type', 'content-length', 'accept-ranges']) {
      console.log(h + ':', headRes.headers.get(h));
    }

    console.log('Testing range request (first 200 bytes)');
    const rangeRes = await fetch(urlData.signedUrl, { headers: { Range: 'bytes=0-199' } });
    console.log('Range status:', rangeRes.status);
    console.log('Range content-length:', rangeRes.headers.get('content-length'));

    const chunk = await rangeRes.arrayBuffer().then(b => b.byteLength);
    console.log('Downloaded bytes (range):', chunk);

    process.exit(0);
  } catch (e) {
    console.error('Error in test script:', e);
    process.exit(10);
  }
}

run();
