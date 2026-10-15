#!/usr/bin/env node
/**
 * make-editorial-art.mjs: the artwork for Editorial CRM and Editorial Gate.
 *
 * The other six products' art was generated with image models (scripts/generate-art.mjs). These
 * two are drawn in code instead, in the same visual language: a glossy squircle tile with a light
 * top and a saturated bottom, an inner glow, and a frosted-white line glyph. Being code, they can
 * be regenerated exactly and tuned by editing the numbers below.
 *
 *   node scripts/make-editorial-art.mjs
 *
 * Writes, into src/assets/art/:
 *   tile-<id>.webp (320), tile-<id>-sm.webp (160), tile-<id>-xs.webp (96)   transparent tiles
 *   product-<id>.webp                                                        1600x1000 card art
 */
import path from 'node:path'
import sharp from 'sharp'

const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../src/assets/art')

const PRODUCTS = {
  editorialcrm: {
    top: '#c3a9ff',
    mid: '#8a63f2',
    bottom: '#4b2bc2',
    rim: '#d8c8ff',
    glow: '#e6dcff',
    // An envelope with a person badge: an audience, and a send.
    glyph: `<g transform="translate(-12 14)">
      <rect x="62" y="96" width="196" height="132" rx="26" />
      <path d="M72 112 L160 176 L248 112" />
      <circle cx="232" cy="100" r="30" fill="#7a52e8" stroke="none" opacity=".9" />
      <circle cx="232" cy="100" r="30" />
      <circle cx="232" cy="92" r="9" />
      <path d="M213 118 C216 106 248 106 251 118" /></g>`,
  },
  editorialgate: {
    top: '#7fe9d6',
    mid: '#27b8a4',
    bottom: '#0a6b66',
    rim: '#b8f3e8',
    glow: '#dcfbf5',
    // A page with a check badge: an article, passed.
    glyph: `
      <path d="M96 62 H190 L232 104 V246 A18 18 0 0 1 214 264 H96 A18 18 0 0 1 78 246 V80 A18 18 0 0 1 96 62 Z" />
      <path d="M190 62 V104 H232" />
      <path d="M106 140 H180 M106 172 H168" />
      <circle cx="216" cy="226" r="40" fill="#0e8f84" stroke="none" opacity=".92" />
      <circle cx="216" cy="226" r="40" />
      <path d="M198 227 L211 240 L236 212" stroke-width="13" />`,
  },
}

/** 320x320 tile: squircle body, vertical gradient, rim light, top gloss, glyph with a soft glow. */
function tileSvg(p) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
  <defs>
    <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.top}"/><stop offset=".5" stop-color="${p.mid}"/><stop offset="1" stop-color="${p.bottom}"/>
    </linearGradient>
    <radialGradient id="gloss" cx=".5" cy=".12" r=".7">
      <stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="floor" cx=".5" cy="1.05" r=".75">
      <stop offset="0" stop-color="${p.glow}" stop-opacity=".45"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="drop" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#000" flood-opacity=".22"/>
    </filter>
    <clipPath id="clip"><rect x="16" y="14" width="288" height="288" rx="84"/></clipPath>
  </defs>
  <g filter="url(#drop)"><rect x="16" y="14" width="288" height="288" rx="84" fill="url(#body)"/></g>
  <g clip-path="url(#clip)">
    <rect x="16" y="14" width="288" height="288" fill="url(#floor)"/>
    <ellipse cx="160" cy="48" rx="150" ry="70" fill="url(#gloss)"/>
  </g>
  <rect x="17.5" y="15.5" width="285" height="285" rx="82.5" fill="none" stroke="${p.rim}" stroke-opacity=".85" stroke-width="3"/>
  <g fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round">
    <g filter="url(#soft)" opacity=".55" stroke="${p.glow}">${p.glyph}</g>
    <g opacity=".95">${p.glyph}</g>
  </g>
</svg>`
}

/** 1600x1000 card art: the colour field, soft rings and flow lines, and the tile large at centre. */
function productSvg(p, tilePng) {
  const rings = [260, 340, 420, 500]
    .map(
      (r, i) =>
        `<circle cx="800" cy="500" r="${r}" fill="none" stroke="#fff" stroke-opacity="${0.34 - i * 0.06}" stroke-width="2"/>`,
    )
    .join('')
  const lines = [-3, -2, -1, 0, 1, 2, 3]
    .map(
      (k) =>
        `<path d="M0 ${500 + k * 70} C 320 ${500 + k * 26}, 520 ${500 + k * 6}, 650 500 M1600 ${500 + k * 70} C 1280 ${500 + k * 26}, 1080 ${500 + k * 6}, 950 500" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2"/>`,
    )
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.mid}"/><stop offset="1" stop-color="${p.bottom}"/>
    </linearGradient>
    <radialGradient id="halo" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="${p.glow}" stop-opacity=".7"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="1000" fill="url(#bg)"/>
  <ellipse cx="800" cy="500" rx="720" ry="460" fill="url(#halo)"/>
  ${rings}${lines}
  <image href="data:image/png;base64,${tilePng.toString('base64')}" x="560" y="260" width="480" height="480"/>
</svg>`
}

for (const [id, p] of Object.entries(PRODUCTS)) {
  const svg = tileSvg(p)
  const big = await sharp(Buffer.from(svg), { density: 288 }).resize(960, 960).png().toBuffer()
  for (const [suffix, size] of [
    ['', 320],
    ['-sm', 160],
    ['-xs', 96],
  ]) {
    await sharp(big)
      .resize(size, size, { kernel: 'lanczos3' })
      .webp({ quality: 92, alphaQuality: 100 })
      .toFile(path.join(OUT, `tile-${id}${suffix}.webp`))
  }
  const tile = await sharp(big).resize(480, 480).png().toBuffer()
  await sharp(Buffer.from(productSvg(p, tile)))
    .webp({ quality: 88 })
    .toFile(path.join(OUT, `product-${id}.webp`))
  console.log('wrote', id)
}
