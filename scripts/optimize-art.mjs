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
 * Tiles are transparent PNGs: they are framed from their alpha bounds so the tile body
 * fills `fit` (88%) of the square, and exported as WebP with alpha at 320, 160 (-sm) and
 * 96 (-xs) px. og-bg is additionally written as a 1200x630 PNG to
 * art-candidates/og-bg-final.png for the OG-image compositor.
 *
 * Candidates come from scripts/generate-art.mjs (art-candidates/<slot>/<file>.png).
 * To swap a winner, edit WINNERS below and re-run.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const SRC = path.join(ROOT, 'art-candidates')
const OUT = path.join(ROOT, 'src/assets/art')
const KB = 1024

/**
 * Chosen candidate per slot (relative to art-candidates/<slot>/).
 * `zoom` > 1 crops tighter around the centre before resizing; `position` is a sharp
 * cover gravity (default 'centre'); `fit` frames a transparent image so its opaque
 * bounds fill that fraction of the output square; `cutShadow` removes the model's
 * baked-in drop shadow (a pale haze that reads as a glow on dark surfaces).
 */
const WINNERS = {
  // One family, all gpt-image-2.5-flare round 2 (shared background motif). Zoom evens out glyph scale.
  'product-studio': { file: 'openai-r2-1.png', zoom: 1.3 },
  'product-voice': { file: 'openai-r2-1.png' },
  // Added products: gpt-image-2.5-flare edits of the approved voice card (same motif and lighting).
  'product-minicrm': { file: 'openai-new-2.png', zoom: 1.3 },
  'product-leadhub': { file: 'openai-new2-4.png', zoom: 1.25 },
  'product-tcc': { file: 'openai-r2-1.png' },
  'product-marathon': { file: 'openai-r2-1.png', zoom: 1.1 },
  // Tiles: gpt-image-2.5-flare transparent re-renders of the approved tiles (openai-1 / openai-r4-1),
  // framed so the tile body fills 88% of the square, shadow removed for clean alpha on any surface.
  'tile-studio': { file: 'openai-alpha-1.png', fit: 0.88, cutShadow: true },
  'tile-voice': { file: 'openai-alpha-1.png', fit: 0.88, cutShadow: true },
  'tile-minicrm': { file: 'openai-alpha-1.png', fit: 0.88, cutShadow: true },
  'tile-leadhub': { file: 'openai-alpha-1.png', fit: 0.88, cutShadow: true },
  'tile-tcc': { file: 'openai-alpha-1.png', fit: 0.88, cutShadow: true },
  'tile-marathon': { file: 'openai-alpha-1.png', fit: 0.88, cutShadow: true },
  'showcase-studio': { file: 'openai-2.png' },
  'footer-texture': { file: 'openai-r3-2.png' },
  'og-bg': { file: 'gemini-2.png' },
}

/** Export targets per slot: [outputName, width, height, maxBytes]. */
function targetsFor(slot) {
  if (slot.startsWith('product-')) return [[slot, 1600, 1000, 200 * KB]]
  if (slot.startsWith('tile-'))
    return [
      [slot, 320, 320, 200 * KB],
      [`${slot}-sm`, 160, 160, 200 * KB],
      [`${slot}-xs`, 96, 96, 200 * KB],
    ]
  if (slot === 'showcase-studio') return [[slot, 1920, 1080, 250 * KB]]
  if (slot === 'footer-texture') return [[slot, 3200, 520, 250 * KB]]
  if (slot === 'og-bg') return [[slot, 1200, 630, 200 * KB]]
  throw new Error(`No export target for ${slot}`)
}

/**
 * Drop everything that is not the solid tile body: binarise alpha at 240 (the body is ~253,
 * the baked shadow haze starts at ~235 and fades out), soften that mask by 0.8px for
 * anti-aliasing, and use it as the new alpha (capped by the original alpha).
 */
async function removeShadow(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width, height } = info
  const binary = Buffer.alloc(width * height)
  for (let i = 0; i < width * height; i++) binary[i] = data[i * 4 + 3] >= 240 ? 255 : 0
  const mask = await sharp(binary, { raw: { width, height, channels: 1 } })
    .blur(0.8)
    .extractChannel(0)
    .raw()
    .toBuffer()
  if (mask.length !== width * height) throw new Error('removeShadow: unexpected mask size')
  for (let i = 0; i < width * height; i++) {
    const a = Math.min(255, Math.round((data[i * 4 + 3] * 255) / 250))
    data[i * 4 + 3] = Math.min(a, mask[i])
  }
  return sharp(data, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer()
}

/** Square crop around the opaque (alpha >= 128) bounds so they fill `fit` of the frame. */
async function frameByAlpha(input, fit) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  let x0 = info.width,
    y0 = info.height,
    x1 = 0,
    y1 = 0
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] >= 128) {
        x0 = Math.min(x0, x)
        x1 = Math.max(x1, x)
        y0 = Math.min(y0, y)
        y1 = Math.max(y1, y)
      }
    }
  }
  const side = Math.round(Math.max(x1 - x0, y1 - y0) / fit)
  const left = Math.round((x0 + x1 - side) / 2)
  const top = Math.round((y0 + y1 - side) / 2)
  // Pad with transparency so the crop may extend past the source edges.
  const pad = side
  const padded = await sharp(input)
    .ensureAlpha()
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer()
  return sharp(padded)
    .extract({ left: left + pad, top: top + pad, width: side, height: side })
    .toBuffer()
}

/** Centre-crop (with optional zoom or alpha framing) and resize to exactly width x height. */
async function render(
  input,
  width,
  height,
  { zoom = 1, position = 'centre', fit, cutShadow } = {},
) {
  const source = cutShadow ? await removeShadow(input) : input
  let img = sharp(fit ? await frameByAlpha(source, fit) : source)
  if (zoom !== 1) {
    const { width: w, height: h } = await img.metadata()
    const cw = Math.round(w / zoom)
    const ch = Math.round(h / zoom)
    img = sharp(
      await img
        .extract({
          left: Math.round((w - cw) / 2),
          top: Math.round((h - ch) / 2),
          width: cw,
          height: ch,
        })
        .toBuffer(),
    )
  }
  return img.resize(width, height, { fit: 'cover', position, kernel: 'lanczos3' }).toBuffer()
}

async function encodeWebp(buffer, maxBytes) {
  for (let quality = 90; quality >= 50; quality -= 4) {
    const out = await sharp(buffer)
      .webp({ quality, alphaQuality: 100, effort: 6, smartSubsample: true })
      .toBuffer()
    if (out.length <= maxBytes || quality - 4 < 50) return { out, quality }
  }
}

const selectors = process.argv.slice(2)
const slots = Object.keys(WINNERS).filter(
  (s) => !selectors.length || selectors.some((sel) => s.startsWith(sel)),
)
await fs.mkdir(OUT, { recursive: true })

for (const slot of slots) {
  const { file, ...opts } = WINNERS[slot]
  const input = path.join(SRC, slot, file)
  for (const [name, w, h, maxBytes] of targetsFor(slot)) {
    const pixels = await render(input, w, h, opts)
    const { out, quality } = await encodeWebp(pixels, maxBytes)
    const dest = path.join(OUT, `${name}.webp`)
    await fs.writeFile(dest, out)
    const flag = out.length > maxBytes ? '  OVER BUDGET' : ''
    console.log(
      `${name}.webp  ${w}x${h}  q${quality}  ${(out.length / KB).toFixed(1)} KB  <- ${slot}/${file}${flag}`,
    )
    if (slot === 'og-bg') {
      await sharp(pixels).png({ compressionLevel: 9 }).toFile(path.join(SRC, 'og-bg-final.png'))
      console.log(`art-candidates/og-bg-final.png  ${w}x${h}  (PNG for OG compositor)`)
    }
  }
}
