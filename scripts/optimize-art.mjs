#!/usr/bin/env node
/**
 * optimize-art.mjs: export the chosen art candidates to optimised WebP in src/assets/art/.
 *
 * Usage (from the project root):
 *
 *   node scripts/optimize-art.mjs            # export every slot in WINNERS
 *   node scripts/optimize-art.mjs tile og-bg # only slots whose id starts with these
 *
 * Each winner is centre-cropped ("cover") to the slot's export size, then encoded as
 * WebP starting at quality 90 (smooth gradients band and lose their grain at lower
 * settings) and stepping down until the file fits its byte budget (200 KB by default,
 * 250 KB for the wide showcase and footer texture).
 * og-bg is additionally written as a 1200x630 PNG to art-candidates/og-bg-final.png
 * for the OG-image compositor.
 *
 * Candidates come from scripts/generate-art.mjs (art-candidates/<slot>/<file>.png).
 * To swap a winner, edit WINNERS below and re-run.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = path.join(ROOT, 'art-candidates');
const OUT = path.join(ROOT, 'src/assets/art');
const KB = 1024;

/**
 * Chosen candidate per slot (relative to art-candidates/<slot>/).
 * `zoom` > 1 crops tighter around the centre before resizing; `position` is a sharp
 * cover gravity (default 'centre').
 */
const WINNERS = {
  // One family, all gpt-image-2.5-flare round 2 (shared background motif). Zoom evens out glyph scale.
  'product-studio': { file: 'openai-r2-1.png', zoom: 1.3 },
  'product-voice': { file: 'openai-r2-1.png' },
  'product-tcc': { file: 'openai-r2-1.png' },
  'product-marathon': { file: 'openai-r2-1.png', zoom: 1.1 },
  // Tiles: gpt-image-2.5-flare; the tile sits at ~68% of the frame, so zoom to ~80%.
  'tile-studio': { file: 'openai-1.png', zoom: 1.18 },
  'tile-voice': { file: 'openai-1.png', zoom: 1.18 },
  'tile-tcc': { file: 'openai-1.png', zoom: 1.18 },
  'tile-marathon': { file: 'openai-r4-1.png', zoom: 1.18 },
  'showcase-studio': { file: 'openai-2.png' },
  'footer-texture': { file: 'openai-r3-2.png' },
  'og-bg': { file: 'gemini-2.png' },
};

/** Export targets per slot: [outputName, width, height, maxBytes]. */
function targetsFor(slot) {
  if (slot.startsWith('product-')) return [[slot, 1600, 1000, 200 * KB]];
  if (slot.startsWith('tile-'))
    return [
      [slot, 320, 320, 200 * KB],
      [`${slot}-sm`, 160, 160, 200 * KB],
    ];
  if (slot === 'showcase-studio') return [[slot, 1920, 1080, 250 * KB]];
  if (slot === 'footer-texture') return [[slot, 3200, 520, 250 * KB]];
  if (slot === 'og-bg') return [[slot, 1200, 630, 200 * KB]];
  throw new Error(`No export target for ${slot}`);
}

/** Centre-crop (with optional zoom) and resize to exactly width x height. */
async function render(input, width, height, { zoom = 1, position = 'centre' } = {}) {
  let img = sharp(input);
  if (zoom !== 1) {
    const { width: w, height: h } = await img.metadata();
    const cw = Math.round(w / zoom);
    const ch = Math.round(h / zoom);
    img = sharp(await img.extract({ left: Math.round((w - cw) / 2), top: Math.round((h - ch) / 2), width: cw, height: ch }).toBuffer());
  }
  return img.resize(width, height, { fit: 'cover', position, kernel: 'lanczos3' }).toBuffer();
}

async function encodeWebp(buffer, maxBytes) {
  for (let quality = 90; quality >= 50; quality -= 4) {
    const out = await sharp(buffer).webp({ quality, effort: 6, smartSubsample: true }).toBuffer();
    if (out.length <= maxBytes || quality - 4 < 50) return { out, quality };
  }
}

const selectors = process.argv.slice(2);
const slots = Object.keys(WINNERS).filter((s) => !selectors.length || selectors.some((sel) => s.startsWith(sel)));
await fs.mkdir(OUT, { recursive: true });

for (const slot of slots) {
  const { file, ...opts } = WINNERS[slot];
  const input = path.join(SRC, slot, file);
  for (const [name, w, h, maxBytes] of targetsFor(slot)) {
    const pixels = await render(input, w, h, opts);
    const { out, quality } = await encodeWebp(pixels, maxBytes);
    const dest = path.join(OUT, `${name}.webp`);
    await fs.writeFile(dest, out);
    const flag = out.length > maxBytes ? '  OVER BUDGET' : '';
    console.log(`${name}.webp  ${w}x${h}  q${quality}  ${(out.length / KB).toFixed(1)} KB  <- ${slot}/${file}${flag}`);
    if (slot === 'og-bg') {
      await sharp(pixels).png({ compressionLevel: 9 }).toFile(path.join(SRC, 'og-bg-final.png'));
      console.log(`art-candidates/og-bg-final.png  ${w}x${h}  (PNG for OG compositor)`);
    }
  }
}
