#!/usr/bin/env node
/**
 * generate-art.mjs: generate candidate artwork for the ET AI Labs gateway
 * with BOTH OpenAI (gpt-image-*) and Google Gemini (Nano Banana Pro) image models.
 *
 * Usage (run from the project root so .env.local is picked up):
 *
 *   node --env-file=.env.local scripts/generate-art.mjs [slot...] [options]
 *
 *   slot        One or more slot ids or prefixes. Omit for all slots.
 *               e.g. `product-studio`, `product` (all 4 product cards), `tile`, `og-bg`
 *   --n=2       Candidates per provider per slot (default 2)
 *   --providers=openai,gemini   Restrict providers (default: both)
 *   --tag=r2    Round label: files become <provider>-<tag>-<i>.png so earlier rounds are kept
 *   --concurrency=5             Parallel requests per provider (default 5)
 *   --list      Print the slots and the resolved prompts, then exit (no API calls)
 *   --models    Print the image models each provider exposes, then exit
 *
 * Env (read from .env.local, never logged):
 *   OPENAI_API_KEY, GEMINI_API_KEY        required
 *   OPENAI_IMAGE_MODELS=a,b               optional override (comma list, used round-robin)
 *   GEMINI_IMAGE_MODEL=gemini-3-pro-image optional override
 *
 * Tile slots re-render the approved tiles (their `ref`, an earlier candidate in art-candidates/)
 * through OpenAI /images/edits with a transparent background, so they sit cleanly on any
 * surface. They are OpenAI-only because Gemini has no alpha output. A product without an
 * approved tile yet (`tileRef` unset) first gets tiles on white from the original tile prompt;
 * set `tileRef` to the chosen one and re-run to make the transparent version.
 *
 * Products added later (`styleRef` set) are generated as edits of an approved card, so they
 * inherit its composition, ring-and-line motif and lighting; `glyphs`/`emblems` hold variants
 * that alternate across candidates.
 *
 * Output: art-candidates/<slot>/<provider>[-<tag>]-<i>.png plus a .json sidecar
 * (model, size, prompt) next to each image. Gemini returns JPEG; it is re-encoded
 * losslessly to PNG so every candidate has the same format.
 * Pick winners by eye, then run scripts/optimize-art.mjs to export WebP.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT_DIR = path.join(ROOT, 'art-candidates');

// ---------------------------------------------------------------------------
// Style
// ---------------------------------------------------------------------------
const GLOBAL_STYLE =
  'Soft, luminous, minimal digital illustration. Pastel-to-saturated gradients ' +
  '(periwinkle #A5BBFC, indigo #556ADC, warm orange #F9730C, amber #FEB12B, sage green #83C040, rose #E380A8). ' +
  'Gradients are vertical or radial only and feel like natural light (dawn/dusk), never plastic. ' +
  'Subtle fine film grain. Smooth, rounded, symmetric geometric forms with thin white line-art details. ' +
  'Clean, calm, premium, lots of negative space, never busy.';

const NEGATIVE =
  'Absolutely no text, no letters, no numbers, no words, no logos, no watermarks, no signatures, ' +
  'no UI chrome, no people, no faces, no hands.';

/** Product accents and their hero glyph (shared by product cards and tiles). */
const PRODUCTS = {
  studio: {
    name: 'AI Creative Studio',
    field:
      'a warm ORANGE field: soft glowing amber #FEB12B and apricot near the top, deepening smoothly ' +
      'to saturated warm orange #F9730C at the bottom, with a gentle lighter radial glow behind the centre',
    tile: 'warm orange #F9730C to amber #FEB12B',
    emblem: 'a rounded picture frame with a four-pointed sparkle star inside it',
    tileRef: 'tile-studio/openai-1.png',
    glyph:
      'a rounded-square picture frame (thick, soft, pillowy border with generously rounded corners, ' +
      'landscape proportion) with a single four-pointed sparkle star floating in the middle of the frame',
  },
  voice: {
    name: 'AI Calling Bot',
    field:
      'a cool INDIGO field: saturated indigo #556ADC near the top, easing smoothly to soft periwinkle ' +
      '#A5BBFC and a pale lavender glow at the bottom, with a gentle lighter radial glow behind the centre',
    tile: 'indigo #556ADC to periwinkle #A5BBFC',
    emblem: 'a rounded phone handset flanked left and right by concentric sound-wave arcs',
    tileRef: 'tile-voice/openai-1.png',
    glyph:
      'a smooth rounded classic telephone handset standing perfectly upright (not tilted), mirrored on its ' +
      'left and right by three concentric sound-wave arcs that grow outward',
  },
  minicrm: {
    name: 'MiniCRM',
    field:
      'a warm GOLDEN AMBER field: light golden #FFCB79 near the top, deepening smoothly through amber #FEB12B ' +
      'to rich golden ochre #DF9C2A at the bottom (a clear golden yellow, distinctly not orange), with a gentle ' +
      'lighter radial glow behind the centre',
    tile: 'light golden #FFCB79 to amber #FEB12B and golden ochre #DF9C2A',
    styleRef: 'product-voice/openai-r2-1.png',
    // Chosen: contact card with trend line (reads cleaner than the kanban as milk glass).
    emblem: 'a rounded contact card with a small circle and a small upward trend line',
    tileRef: 'tile-minicrm/openai-new-2.png',
    glyphs: [
      'a simple rounded kanban board: a soft rounded-rectangle board holding three rounded vertical columns, ' +
        'each column containing two or three small rounded card tiles of slightly different heights',
      'a rounded contact card (soft rounded rectangle, landscape) with a small plain circle on its left half ' +
        'and a small smooth upward trend line rising across its right half, ending in a tiny rounded arrowhead',
    ],
    emblems: [
      'a simple kanban board: three rounded vertical columns holding small rounded cards',
      'a rounded contact card with a small circle and a small upward trend line',
    ],
  },
  leadhub: {
    name: 'LeadHub',
    field:
      'a soft CORAL field: soft coral #EBA18F near the top, deepening smoothly through coral #DB715C to warm ' +
      'brick red #C43D2B at the bottom (coral red, distinctly not pink), with a gentle lighter radial glow ' +
      'behind the centre',
    tile: 'soft coral #EBA18F to coral #DB715C and warm brick red #C43D2B',
    styleRef: 'product-voice/openai-r2-1.png',
    // Chosen: the 45-degree magnet (an upright magnet with dots read as the letter U).
    emblem: 'a horseshoe magnet tilted 45 degrees with banded pole tips facing the upper right and three small dots near the poles',
    tileRef: 'tile-leadhub/openai-new2-2.png',
    glyphs: [
      'a rounded funnel (wide rounded rim at the top, narrowing smoothly to a short rounded spout at the ' +
        'bottom) with three small glossy spheres dropping into its top in a gentle column; nothing below the spout',
      'a chunky rounded horseshoe magnet tilted 45 degrees so its two rounded pole tips face the upper right ' +
        '(it must read clearly as a magnet, never as a letter), with three small glossy spheres floating toward the poles',
    ],
    emblems: [
      'a funnel with three small dots dropping into its top, nothing below the spout',
      'a horseshoe magnet tilted 45 degrees with its poles facing the upper right and three small dots near the poles',
    ],
  },
  tcc: {
    name: 'TCC Video Verification',
    field:
      'a fresh GREEN field: sage green #83C040 near the top, easing smoothly to soft pale mint #DDF3E2 ' +
      'at the bottom (stay green and mint, no blue), with a gentle lighter radial glow behind the centre',
    tile: 'sage green #83C040 to soft mint',
    emblem: 'a rounded shield containing a play triangle with a small check mark',
    tileRef: 'tile-tcc/openai-1.png',
    glyph:
      'a rounded soft shield with an embossed rounded play-triangle in its centre and a small circular ' +
      'check-mark badge sitting at the bottom tip of the shield',
  },
  marathon: {
    name: 'Marathon knowledge chatbot',
    field:
      'a soft PINK field: rose #E380A8 near the top, easing smoothly to light blush pink and a faint warm ' +
      'peach glow at the bottom, with a gentle lighter radial glow behind the centre',
    tile: 'rose #E380A8 to light blush pink',
    emblem: 'a rounded speech bubble with a small tail, containing three small round dots in a row',
    tileRef: 'tile-marathon/openai-r4-1.png',
    glyph:
      'a rounded speech bubble (soft pill-like rounded rectangle with a small rounded tail) floating above ' +
      'a gentle winding path; the path is drawn in thin glowing white line-art as two mirror-symmetric edges ' +
      'that start wide at the bottom of the frame and meander inward, converging in perspective just below ' +
      'the bubble like a road receding toward it',
  },
};

const productPrompt = (p) =>
  `${GLOBAL_STYLE} Landscape product card artwork. The whole frame is one smooth, saturated-but-soft vertical ` +
  `gradient: ${p.field}. Behind the glyph, a very faint hairline white line-art motif (about 12% opacity), ` +
  `identical in every card of this series: four or five thin concentric circles centred on the glyph, plus a few ` +
  `long, gently curved lines sweeping outward to the left and right edges as a mirror image, fading toward the ` +
  `edges. No dots, no nodes, no stars in the background. ` +
  `In the exact centre floats a single glyph: ${p.glyph}. The glyph is rendered as a soft, white, glossy, ` +
  `translucent 3D object, like frosted milk-glass or porcelain: smooth rounded edges, gentle inner glow, ` +
  `delicate specular highlights, a very soft diffuse shadow, front-facing, symmetric. The glyph's height is about ` +
  `one third of the frame height, perfectly centred horizontally and vertically, with calm generous negative ` +
  `space around it. Soft diffuse studio lighting from above. ${NEGATIVE}`;

/** A new card in the approved family: an edit of an approved card (the reference image). */
const newCardPrompt = (p, glyph) =>
  `Using this image as the exact style reference, create a new card for the same series. Keep exactly the ` +
  `same composition and framing, the same faint hairline white line-art motif (four or five thin concentric ` +
  `circles centred on the glyph plus long, gently curved lines sweeping out to the left and right edges as a ` +
  `mirror image), the same soft diffuse lighting from above, the same very soft shadow, the same fine film ` +
  `grain, and the same glyph size (about one third of the frame height) and centred position. Replace the ` +
  `glyph with: ${glyph}. Render it in exactly the same soft, white, glossy, translucent milk-glass / porcelain ` +
  `material, with smooth rounded edges, gentle inner glow and delicate specular highlights. Change the ` +
  `background gradient to ${p.field}. ${NEGATIVE}`;

/** Re-render an approved tile (sent as the reference image) on a transparent background. */
const tileTransparentPrompt = (p) =>
  `Re-render this exact app-icon tile on a fully transparent background. Keep everything identical: the same ` +
  `rounded-square (squircle) shape and proportions, the same ${p.tile} frosted glossy glass gradient, the glossy ` +
  `top highlight, the soft inner glow and depth, and the same embossed soft-white emblem (${p.emblem}). Remove ` +
  `the white backdrop entirely so only the tile remains, surrounded by transparent pixels, with at most a very ` +
  `soft, subtle contact shadow directly beneath the tile. ${NEGATIVE}`;

/** Original text-to-image tile prompt (used to create the approved tiles on white). */
const tilePrompt = (p) =>
  `${GLOBAL_STYLE} A single app-icon style rounded square tile (squircle), viewed straight-on, centred, filling ` +
  `about 80% of the frame. The tile is frosted glass with glossy depth, filled with a soft vertical ${p.tile} ` +
  `gradient, a soft luminous inner glow, a subtle glossy highlight along the top edge. In the centre of the tile, ` +
  `a subtle embossed symmetric emblem in soft white: ${p.emblem}, simplified and gently debossed into the glass. ` +
  `A soft, diffuse drop shadow beneath the tile. Isolated on a pure, flat white #FFFFFF background with nothing ` +
  `else in the frame. ${NEGATIVE}`;

// ---------------------------------------------------------------------------
// Slots. `openai` = list of sizes to try in order; `gemini` = aspect ratio.
// ---------------------------------------------------------------------------
const SLOTS = {};
for (const [key, p] of Object.entries(PRODUCTS)) {
  SLOTS[`product-${key}`] = p.styleRef
    ? {
        prompts: p.glyphs.map((g) => newCardPrompt(p, g)),
        ref: p.styleRef,
        openai: ['2048x1280'],
        gemini: { aspectRatio: '16:9', imageSize: '2K' },
      }
    : {
        prompt: productPrompt(p),
        openai: ['2048x1280', '1536x1024'],
        gemini: { aspectRatio: '16:9', imageSize: '2K' },
      };
}
for (const [key, p] of Object.entries(PRODUCTS)) {
  SLOTS[`tile-${key}`] = p.tileRef
    ? {
        prompt: tileTransparentPrompt(p),
        ref: p.tileRef,
        openai: ['1024x1024'],
        openaiParams: { background: 'transparent' },
        providers: ['openai'],
      }
    : {
        prompts: (p.emblems ?? [p.emblem]).map((emblem) => tilePrompt({ ...p, emblem })),
        openai: ['1024x1024'],
        providers: ['openai'],
      };
}
SLOTS['showcase-studio'] = {
  prompt:
    `${GLOBAL_STYLE} Wide, very calm panel artwork for an AI creative studio. A soft sky gradient: pale periwinkle ` +
    `#A5BBFC at the very top, warming through peach into amber #FEB12B and a luminous warm orange #F9730C glow ` +
    `at the bottom. Rising from the bottom centre, a symmetric set of layered rounded arches and nested rounded ` +
    `picture-frame shapes (3 to 5 concentric layers, each slightly lighter toward the centre, smooth matte ` +
    `gradient fills from orange to soft peach, no outlines), like a gentle threshold. A few small soft white ` +
    `four-pointed sparkles and tiny rounded geometric shapes float sparingly above the arches, suggesting ` +
    `creativity. Thin white line-art concentric circles at very low opacity behind the arches. Centre-weighted, ` +
    `perfectly symmetric, generous empty negative space across the top third. ${NEGATIVE}`,
  openai: ['2048x1152', '1536x1024'],
  gemini: { aspectRatio: '16:9', imageSize: '2K' },
};
SLOTS['footer-texture'] = {
  prompt:
    'Extreme close-up macro photograph of a flat sheet of salmon-pink newsprint: the soft, warm pink of a ' +
    'financial broadsheet newspaper (around #F4B9A0, with lighter #FAD7C6 highlights and deeper rose #D98A78 ' +
    'in the shadows). Camera looks almost straight down at the paper; a gentle shallow depth of field softens ' +
    'the far edges while the central band stays crisp. Visible fine paper fibres, soft tooth and a gentle ' +
    'natural grain. Across the paper, faint abstract traces of printing: round, evenly spaced halftone dots ' +
    'forming soft gradient patches in muted rose and warm charcoal (classic newspaper photo halftone, not ' +
    'scales, not snakeskin), gentle smudged ink impressions and blurred ink haze, all abstract. Warm natural ' +
    'morning light from the left with soft highlights on the fibres. Rich, warm, natural colour with even ' +
    'coverage across the whole wide frame. ' +
    'It is paper, not leather, not fabric: no stitching, no seams, no creases, no folds. Purely abstract texture: ' +
    'no legible letters, no characters, no numerals, no words, no headlines, no logos, no watermarks.',
  openai: ['3072x1024', '2048x1152', '1536x1024'],
  gemini: { aspectRatio: '4:1', imageSize: '2K' },
};
SLOTS['og-bg'] = {
  prompt:
    `${GLOBAL_STYLE} Social card background, sunrise light. A warm orange #F9730C core glow at the top centre, ` +
    `radiating softly and fading downward through amber #FEB12B and peach into soft periwinkle #A5BBFC and ` +
    `near-white at the bottom. Faint thin white concentric line circles centred on the glow at very low opacity. ` +
    `Subtle fine film grain. The centre of the image is calm, smooth and empty so a title can be overlaid later. ` +
    `Perfectly symmetric left-to-right. ${NEGATIVE}`,
  openai: ['2048x1072', '1536x1024'],
  gemini: { aspectRatio: '16:9', imageSize: '2K' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function withRetry(fn, label, tries = 4) {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (err) {
      const retryable = !err.status || err.status === 429 || err.status >= 500;
      if (!retryable || i >= tries) throw err;
      const wait = 4000 * i;
      console.warn(`  ! ${label}: ${err.message.slice(0, 160)} (retry ${i} in ${wait / 1000}s)`);
      await sleep(wait);
    }
  }
}

/** Run async task factories with a fixed concurrency limit. */
async function pool(tasks, limit) {
  const results = [];
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------
const OPENAI = 'https://api.openai.com/v1';
const GEMINI = 'https://generativelanguage.googleapis.com/v1beta';
const openaiAuth = () => ({ Authorization: `Bearer ${process.env.OPENAI_API_KEY}` });
const openaiHeaders = () => ({ ...openaiAuth(), 'Content-Type': 'application/json' });
const geminiHeaders = () => ({ 'x-goog-api-key': process.env.GEMINI_API_KEY, 'Content-Type': 'application/json' });

async function listOpenAIImageModels() {
  const r = await fetch(`${OPENAI}/models`, { headers: openaiAuth() });
  if (!r.ok) throw new ApiError(r.status, `OpenAI /models ${r.status}`);
  const { data } = await r.json();
  return data.filter((m) => /^gpt-image-/.test(m.id));
}

async function listGeminiImageModels() {
  const models = [];
  let token = '';
  do {
    const r = await fetch(`${GEMINI}/models?pageSize=1000${token ? `&pageToken=${token}` : ''}`, {
      headers: geminiHeaders(),
    });
    if (!r.ok) throw new ApiError(r.status, `Gemini /models ${r.status}`);
    const j = await r.json();
    models.push(...(j.models ?? []));
    token = j.nextPageToken ?? '';
  } while (token);
  return models.filter((m) => /image|imagen/i.test(m.name)).map((m) => m.name.replace(/^models\//, ''));
}

/** Newest gpt-image family (highest version number, no dated snapshots, no -mini). */
async function resolveOpenAIModels() {
  if (process.env.OPENAI_IMAGE_MODELS) return process.env.OPENAI_IMAGE_MODELS.split(',').map((s) => s.trim());
  const ids = (await listOpenAIImageModels())
    .map((m) => m.id)
    .filter((id) => !/\d{4}-\d{2}-\d{2}$/.test(id) && !/mini|latest/.test(id));
  const version = (id) => parseFloat(id.match(/^gpt-image-([\d.]+)/)?.[1] ?? '0');
  const top = Math.max(...ids.map(version));
  return ids.filter((id) => version(id) === top).sort();
}

async function resolveGeminiModels() {
  const preferred = [
    process.env.GEMINI_IMAGE_MODEL,
    'gemini-3-pro-image',
    'gemini-3-pro-image-preview',
    'gemini-3.1-flash-image',
    'gemini-2.5-flash-image',
  ].filter(Boolean);
  const available = new Set(await listGeminiImageModels());
  return preferred.filter((m) => available.has(m));
}

/** Text-to-image, or an edit of `ref` (path under art-candidates/) when given. */
async function openaiGenerate(model, prompt, sizes, { ref, params = {} } = {}) {
  const refBuffer = ref ? await fs.readFile(path.join(OUT_DIR, ref)) : null;
  let lastErr;
  for (const size of sizes) {
    const fields = { model, prompt, size, quality: 'high', output_format: 'png', n: 1, ...params };
    let r;
    if (refBuffer) {
      const form = new FormData();
      for (const [k, v] of Object.entries(fields)) form.append(k, String(v));
      form.append('image', new Blob([refBuffer], { type: 'image/png' }), path.basename(ref));
      r = await fetch(`${OPENAI}/images/edits`, { method: 'POST', headers: openaiAuth(), body: form });
    } else {
      r = await fetch(`${OPENAI}/images/generations`, {
        method: 'POST',
        headers: openaiHeaders(),
        body: JSON.stringify(fields),
      });
    }
    const j = await r.json().catch(() => ({}));
    if (r.ok) return { buffer: Buffer.from(j.data[0].b64_json, 'base64'), model, size };
    lastErr = new ApiError(r.status, `OpenAI ${model} ${size}: ${j.error?.message ?? r.statusText}`);
    // Unsupported size: fall through to the next size; anything else bubbles up.
    if (!(r.status === 400 && /size|resolution|aspect/i.test(lastErr.message))) throw lastErr;
  }
  throw lastErr;
}

async function geminiGenerate(models, prompt, imageConfig, { ref } = {}) {
  const parts = [{ text: prompt }];
  if (ref) {
    const png = await sharp(path.join(OUT_DIR, ref)).png().toBuffer();
    parts.unshift({ inlineData: { mimeType: 'image/png', data: png.toString('base64') } });
  }
  let lastErr;
  for (const model of models) {
    const r = await fetch(`${GEMINI}/models/${model}:generateContent`, {
      method: 'POST',
      headers: geminiHeaders(),
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { responseModalities: ['IMAGE'], imageConfig },
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok) {
      const part = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (part) {
        const png = await sharp(Buffer.from(part.inlineData.data, 'base64')).png().toBuffer();
        return { buffer: png, model, size: imageConfig.aspectRatio };
      }
      lastErr = new ApiError(502, `Gemini ${model}: no image (${j.candidates?.[0]?.finishReason ?? 'unknown'})`);
      console.warn(`  ! ${lastErr.message} (falling back to the next model)`);
      continue;
    }
    lastErr = new ApiError(r.status, `Gemini ${model}: ${j.error?.message ?? r.statusText}`);
    if (r.status === 429 || r.status >= 500) throw lastErr; // let withRetry handle transient errors
    console.warn(`  ! ${lastErr.message.slice(0, 160)} (falling back to the next model)`);
  }
  throw lastErr;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const flag = (name, def) => {
  const a = args.find((x) => x === `--${name}` || x.startsWith(`--${name}=`));
  if (!a) return def;
  return a.includes('=') ? a.split('=').slice(1).join('=') : true;
};
const selectors = args.filter((a) => !a.startsWith('--'));
const slotIds = Object.keys(SLOTS).filter(
  (id) => !selectors.length || selectors.some((s) => id.startsWith(s)),
);
const n = Number(flag('n', 2));
const providers = String(flag('providers', 'openai,gemini')).split(',');
const tag = flag('tag', '');
const concurrency = Number(flag('concurrency', 5));

if (flag('list')) {
  for (const id of slotIds) console.log(`\n[${id}]\n${(SLOTS[id].prompts ?? [SLOTS[id].prompt]).join('\n---\n')}`);
  process.exit(0);
}
if (!process.env.OPENAI_API_KEY || !process.env.GEMINI_API_KEY) {
  console.error('Missing OPENAI_API_KEY / GEMINI_API_KEY. Run with: node --env-file=.env.local scripts/generate-art.mjs');
  process.exit(1);
}
if (flag('models')) {
  console.log('OpenAI:', (await listOpenAIImageModels()).map((m) => m.id).join(', '));
  console.log('Gemini:', (await listGeminiImageModels()).join(', '));
  process.exit(0);
}
if (!slotIds.length) {
  console.error(`No slot matches ${selectors.join(' ')}. Slots: ${Object.keys(SLOTS).join(', ')}`);
  process.exit(1);
}

const openaiModels = providers.includes('openai') ? await resolveOpenAIModels() : [];
const geminiModels = providers.includes('gemini') ? await resolveGeminiModels() : [];
console.log(`OpenAI models: ${openaiModels.join(', ') || '(skipped)'}`);
console.log(`Gemini models: ${geminiModels.join(' -> ') || '(skipped)'}`);
console.log(`Slots: ${slotIds.join(', ')} | ${n} per provider${tag ? ` | tag ${tag}` : ''}\n`);

const jobs = { openai: [], gemini: [] };
for (const id of slotIds) {
  const slot = SLOTS[id];
  for (let i = 1; i <= n; i++) {
    const prompt = slot.prompts ? slot.prompts[(i - 1) % slot.prompts.length] : slot.prompt;
    const file = path.join(OUT_DIR, id, `%p${tag ? `-${tag}` : ''}-${i}.png`);
    const save = async (provider, res) => {
      const out = file.replace('%p', provider);
      await fs.mkdir(path.dirname(out), { recursive: true });
      await fs.writeFile(out, res.buffer);
      await fs.writeFile(
        out.replace(/\.png$/, '.json'),
        JSON.stringify(
          { slot: id, provider, model: res.model, size: res.size, ref: slot.ref ?? null, prompt },
          null,
          2,
        ),
      );
      const meta = await sharp(res.buffer).metadata();
      console.log(`  ok ${path.relative(ROOT, out)}  ${res.model}  ${meta.width}x${meta.height}`);
      return out;
    };
    const fail = (label) => (err) => {
      console.error(`  FAIL ${label}: ${err.message.slice(0, 240)}`);
      return null;
    };
    const allowed = (p) => !slot.providers || slot.providers.includes(p);
    if (openaiModels.length && allowed('openai')) {
      const model = openaiModels[(i - 1) % openaiModels.length];
      const label = `${id} openai-${i}`;
      const opts = { ref: slot.ref, params: slot.openaiParams };
      jobs.openai.push(() =>
        withRetry(() => openaiGenerate(model, prompt, slot.openai, opts), label)
          .then((res) => save('openai', res))
          .catch(fail(label)),
      );
    }
    if (geminiModels.length && allowed('gemini')) {
      const label = `${id} gemini-${i}`;
      jobs.gemini.push(() =>
        withRetry(() => geminiGenerate(geminiModels, prompt, slot.gemini, { ref: slot.ref }), label)
          .then((res) => save('gemini', res))
          .catch(fail(label)),
      );
    }
  }
}

const started = Date.now();
const results = (await Promise.all([pool(jobs.openai, concurrency), pool(jobs.gemini, concurrency)])).flat();
const ok = results.filter(Boolean).length;
console.log(`\nDone: ${ok}/${results.length} candidates in ${((Date.now() - started) / 1000).toFixed(0)}s`);
if (ok < results.length) process.exitCode = 1;
