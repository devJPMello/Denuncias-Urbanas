/**
 * Generates PWA icons as PNG files using only Node.js built-ins.
 * Output: public/icons/icon-192.png, icon-512.png, icon-maskable-512.png
 *
 * Design: blue (#2563EB) background + white map-pin + blue inner dot.
 */
import fs from 'fs';
import zlib from 'zlib';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── CRC-32 ────────────────────────────────────────────────────────────────────
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[i] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++)
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// ── PNG helpers ───────────────────────────────────────────────────────────────
function chunk(type, data) {
  const len = Buffer.allocUnsafe(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crcBuf]);
}

function makePNG(size, pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // 8-bit
  ihdr[9] = 2; // RGB
  ihdr[10] = ihdr[11] = ihdr[12] = 0;

  // raw scanlines: filter-byte(0) + RGB rows
  const raw = Buffer.allocUnsafe((1 + size * 3) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const s = (y * size + x) * 3;
      const d = y * (size * 3 + 1) + 1 + x * 3;
      raw[d] = pixels[s];
      raw[d + 1] = pixels[s + 1];
      raw[d + 2] = pixels[s + 2];
    }
  }

  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Drawing ───────────────────────────────────────────────────────────────────
const BG = [37, 99, 235]; // #2563EB

function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/**
 * Draw white map-pin + blue inner dot with AA.
 * @param {number} size   canvas size (pixels)
 * @param {number} scale  how much of the canvas the pin occupies (0–1)
 */
function drawIcon(size, scale = 0.88) {
  const pixels = new Uint8Array(size * size * 3);

  // fill background
  for (let i = 0; i < size * size; i++) {
    pixels[i * 3] = BG[0];
    pixels[i * 3 + 1] = BG[1];
    pixels[i * 3 + 2] = BG[2];
  }

  const cx = size / 2;
  const headR = size * scale * 0.27; // radius of pin-head circle
  const headCy = size / 2 - headR * 0.25; // slightly above center
  const tipY = headCy + headR * 2.6; // pin-tail tip
  const AA = 1.5; // anti-alias width in pixels

  // ── white pin shape ────────────────────────────────────────────────────────
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 3;
      const dx = x - cx;
      const dy = y - headCy;

      // SDF: head circle
      const distHead = Math.sqrt(dx * dx + dy * dy) - headR;

      // SDF: tail (isosceles triangle pointing down)
      let distTail = Infinity;
      if (y > headCy && y < tipY) {
        const progress = (y - headCy) / (tipY - headCy);
        const halfW = headR * (1 - progress);
        distTail = Math.abs(dx) - halfW;
      }

      const dist = Math.min(distHead, distTail);

      if (dist <= 0) {
        pixels[idx] = 255;
        pixels[idx + 1] = 255;
        pixels[idx + 2] = 255;
      } else if (dist < AA) {
        const t = dist / AA;
        pixels[idx] = Math.round(lerp(255, BG[0], t));
        pixels[idx + 1] = Math.round(lerp(255, BG[1], t));
        pixels[idx + 2] = Math.round(lerp(255, BG[2], t));
      }
    }
  }

  // ── blue inner dot ─────────────────────────────────────────────────────────
  const innerR = headR * 0.42;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 3;
      const dx = x - cx;
      const dy = y - headCy;
      const dist = Math.sqrt(dx * dx + dy * dy) - innerR;
      if (dist <= 0) {
        pixels[idx] = BG[0];
        pixels[idx + 1] = BG[1];
        pixels[idx + 2] = BG[2];
      } else if (dist < AA) {
        const t = dist / AA;
        pixels[idx] = Math.round(lerp(BG[0], 255, t));
        pixels[idx + 1] = Math.round(lerp(BG[1], 255, t));
        pixels[idx + 2] = Math.round(lerp(BG[2], 255, t));
      }
    }
  }

  return pixels;
}

// ── Generate ──────────────────────────────────────────────────────────────────
const outDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });

const icons = [
  { file: 'icon-192.png', size: 192, scale: 0.88 },
  { file: 'icon-512.png', size: 512, scale: 0.88 },
  { file: 'icon-maskable-512.png', size: 512, scale: 0.72 }, // safe-zone: 80%
];

for (const { file, size, scale } of icons) {
  const pixels = drawIcon(size, scale);
  const png = makePNG(size, pixels);
  fs.writeFileSync(path.join(outDir, file), png);
  console.log(`✓  ${file}  (${size}×${size})`);
}

console.log('\nAll icons written to public/icons/');
