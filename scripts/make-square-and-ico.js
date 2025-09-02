#!/usr/bin/env node
// Resize/crop PNG to square and produce favicon.ico using png-to-ico
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
// png-to-ico may export a default when installed; handle both cases
const pngToIcoModule = require('png-to-ico');
const pngToIco = pngToIcoModule && (pngToIcoModule.default || pngToIcoModule);

async function run() {
  const root = path.resolve(__dirname, '..');
  const src = path.join(root, 'public/images/logo_sin_letra.png');
  const tmp = path.join(root, 'public/.logo_square.png');
  const out = path.join(root, 'public/favicon.ico');

  if (!fs.existsSync(src)) {
    console.error('Source PNG not found:', src);
    process.exit(2);
  }

  const img = await Jimp.read(src);
  const size = Math.max(img.bitmap.width, img.bitmap.height);
  const bg = new Jimp(size, size, 0xffffffff);
  img.contain(size, size, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);
  bg.composite(img, 0, 0);
  await bg.resize(64, 64).writeAsync(tmp);

  if (!pngToIco || typeof pngToIco !== 'function') {
    throw new Error('png-to-ico not available as function');
  }

  // png-to-ico expects an array of paths (or buffers); pass the tmp file
  const buffer = await pngToIco([tmp]);
  fs.writeFileSync(out, buffer);
  fs.unlinkSync(tmp);
  console.log('Created', out);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
