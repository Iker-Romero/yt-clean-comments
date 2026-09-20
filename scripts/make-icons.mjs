import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { crc32, deflateSync } from 'node:zlib';

/**
 * Draws the toolbar icon: the generic person glyph the extension puts in place
 * of every comment photo, on YouTube red so the icon reads as belonging to
 * YouTube at 16px. Written by hand so the build has no image dependency.
 *
 * The disc colour is deliberately not one of the avatar palette entries — those
 * are muted so they do not draw the eye, which is the opposite of what a
 * toolbar icon needs.
 */

const DISC = [0xff, 0x00, 0x00];
const GLYPH = [0xff, 0xff, 0xff];
const SUPERSAMPLE = 3;

const inDisc = (x, y) => (x - 0.5) ** 2 + (y - 0.5) ** 2 <= 0.5 ** 2;
const inHead = (x, y) => (x - 0.5) ** 2 + (y - 0.37) ** 2 <= 0.145 ** 2;
const inBody = (x, y) =>
  y > 0.56 && y < 0.82 && ((x - 0.5) / 0.3) ** 2 + ((y - 0.95) / 0.34) ** 2 <= 1;

/** Returns [r, g, b, a] for a pixel, anti-aliased by supersampling. */
function sample(px, py, size) {
  let disc = 0;
  let glyph = 0;
  for (let sy = 0; sy < SUPERSAMPLE; sy++) {
    for (let sx = 0; sx < SUPERSAMPLE; sx++) {
      const x = (px + (sx + 0.5) / SUPERSAMPLE) / size;
      const y = (py + (sy + 0.5) / SUPERSAMPLE) / size;
      if (!inDisc(x, y)) continue;
      disc++;
      if (inHead(x, y) || inBody(x, y)) glyph++;
    }
  }
  const total = SUPERSAMPLE * SUPERSAMPLE;
  if (disc === 0) return [0, 0, 0, 0];
  const glyphRatio = glyph / disc;
  const colour = DISC.map((c, i) => Math.round(c + (GLYPH[i] - c) * glyphRatio));
  return [...colour, Math.round((disc / total) * 255)];
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, checksum]);
}

function encodePng(size) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  let offset = 0;
  for (let y = 0; y < size; y++) {
    raw[offset++] = 0; // filter type: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = sample(x, y, size);
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
      raw[offset++] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

export async function makeIcons(outDir) {
  await mkdir(outDir, { recursive: true });
  await Promise.all(
    [16, 32, 48, 128].map((size) =>
      writeFile(resolve(outDir, `icon-${size}.png`), encodePng(size)),
    ),
  );
}
