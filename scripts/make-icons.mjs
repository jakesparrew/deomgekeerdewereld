/**
 * Maakt alle icoontjes uit het echte logo (public/images/zon.png).
 *
 *   node scripts/make-icons.mjs
 *
 * Het logo is een lijntekening. Klein geschaald wordt dat een vage gele vlek,
 * dus kleuren we de zon vol geel in en tekenen we de lijnen er donker in: zo
 * blijft het gezicht leesbaar, ook op een tabblad.
 *
 *   public/favicon.ico            16, 32 en 48 px — het tabblad
 *   public/favicon-32.png         idem, voor browsers die liever PNG hebben
 *   public/apple-touch-icon.png   180 px — op het startscherm van een iPhone
 *   public/icons/icon-192.png     voor Android en de site.webmanifest
 *   public/icons/icon-512.png
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));

const YELLOW = [0xff, 0xd2, 0x3f]; // --amber
const DARK = [0x0c, 0x0a, 0x09]; // --bg
/** Midden van de zonneschijf in zon.png (640 × 685). */
const CENTER = { x: 343, y: 338 };

async function filledSun() {
  const { data: alpha, info } = await sharp(root('public/images/zon.png'))
    .extractChannel('alpha')
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;

  // Alles wat transparant is én met de rand verbonden, is "buiten".
  // De rest is de zon zelf, ook de lege vlakken in het gezicht.
  const outside = new Uint8Array(W * H);
  const stack = [];
  for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
  for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
  while (stack.length) {
    const i = stack.pop();
    if (outside[i] || alpha[i] > 100) continue;
    outside[i] = 1;
    const x = i % W;
    if (x > 0) stack.push(i - 1);
    if (x < W - 1) stack.push(i + 1);
    if (i >= W) stack.push(i - W);
    if (i < W * (H - 1)) stack.push(i + W);
  }

  const rgba = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    if (outside[i]) continue;
    const t = alpha[i] / 255; // lijn = donker, vlak = geel
    for (let c = 0; c < 3; c++) rgba[i * 4 + c] = Math.round(YELLOW[c] * (1 - t) + DARK[c] * t);
    rgba[i * 4 + 3] = 255;
  }
  return sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}

const tile = (size) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      `<rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="#0c0a09"/></svg>`,
  );

/** Klein: ingezoomd op de zon, de punten van de stralen vallen eraf. */
async function small(sun, size) {
  const side = 500;
  const crop = await sharp(sun)
    .extract({ left: CENTER.x - side / 2, top: CENTER.y - side / 2, width: side, height: side })
    .resize(size, size, { kernel: 'lanczos3' })
    .sharpen({ sigma: 0.5 })
    .png()
    .toBuffer();
  return sharp(tile(size)).composite([{ input: crop }]).png().toBuffer();
}

/** Groot: de hele zon, met wat ruimte errond. Op een donkere achtergrond, zonder ronde hoeken
 *  (iOS en Android ronden zelf af). */
async function large(sun, size) {
  const inner = Math.round(size * 0.86);
  const img = await sharp(sun)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 3, background: '#0c0a09' } })
    .composite([{ input: img, gravity: 'centre' }])
    .png()
    .toBuffer();
}

/** .ico met PNG's erin; dat lezen alle huidige browsers. */
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, n) => {
    const e = 6 + 16 * n;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4); // kleurvlakken
    header.writeUInt16LE(32, e + 6); // bits per pixel
    header.writeUInt32LE(png.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.png)]);
}

const sun = await filledSun();
const sizes = [16, 32, 48];
const tabIcons = await Promise.all(sizes.map(async (size) => ({ size, png: await small(sun, size) })));

mkdirSync(root('public/icons'), { recursive: true });
writeFileSync(root('public/favicon.ico'), ico(tabIcons));
writeFileSync(root('public/favicon-32.png'), tabIcons[1].png);
writeFileSync(root('public/apple-touch-icon.png'), await large(sun, 180));
writeFileSync(root('public/icons/icon-192.png'), await large(sun, 192));
writeFileSync(root('public/icons/icon-512.png'), await large(sun, 512));
console.log('Icoontjes gemaakt in public/.');
