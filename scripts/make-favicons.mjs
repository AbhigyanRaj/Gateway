// Builds the favicon set from the emblem geometry in src/components/brand/paths.ts:
//   public/favicon.svg, public/favicon-32.png, public/apple-touch-icon.png
// The art: the white emblem on an ink (#2a2c33) rounded-square tile.
// Run: node scripts/make-favicons.mjs   (Node 23+ strips the .ts types natively)
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

import { EMBLEM_DIAMOND, EMBLEM_PETALS_PATH, EMBLEM_STROKE } from '../src/components/brand/paths.ts'

const INK = '#2a2c33'
const pub = (name) => fileURLToPath(new URL(`../public/${name}`, import.meta.url))

/**
 * @param {object} o
 * @param {number} o.radius  tile corner radius in a 64 grid
 * @param {number} o.scale   emblem size as a fraction of the tile
 * @param {number} o.stroke  petal stroke in the 48 emblem grid
 * @param {boolean} [o.square] full-bleed square (iOS applies its own mask)
 */
function tileSvg({ radius, scale, stroke, square = false }) {
  const size = 64 * scale
  const offset = (64 - size) / 2
  const k = size / 48
  const tile = square
    ? `<rect width="64" height="64" fill="${INK}"/>`
    : `<rect width="64" height="64" rx="${radius}" fill="${INK}"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${tile}<g transform="translate(${offset.toFixed(3)} ${offset.toFixed(3)}) scale(${k.toFixed(4)})"><path d="${EMBLEM_PETALS_PATH}" fill="none" stroke="#fff" stroke-width="${stroke}" stroke-linejoin="round"/><path d="${EMBLEM_DIAMOND}" fill="#fff"/></g></svg>`
}

// SVG favicon: scales cleanly, standard stroke.
const svg = tileSvg({ radius: 14, scale: 0.7, stroke: EMBLEM_STROKE })
await writeFile(pub('favicon.svg'), svg + '\n')

// 32px PNG: slightly heavier stroke so the petals survive the downscale.
await sharp(Buffer.from(tileSvg({ radius: 14, scale: 0.74, stroke: 3 })), { density: 576 })
  .resize(32, 32)
  .png({ compressionLevel: 9 })
  .toFile(pub('favicon-32.png'))

// Apple touch icon: full-bleed square (iOS rounds it), emblem with breathing room.
await sharp(Buffer.from(tileSvg({ radius: 0, scale: 0.62, stroke: EMBLEM_STROKE, square: true })), {
  density: 576,
})
  .resize(180, 180)
  .png({ compressionLevel: 9 })
  .toFile(pub('apple-touch-icon.png'))

console.log('favicons written')
