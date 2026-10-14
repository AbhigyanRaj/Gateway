// Generated artwork (see scripts/generate-art.mjs and scripts/optimize-art.mjs).
// Corners are square; apply the rounded radius in CSS.
import productStudio from './product-studio.webp'
import productVoice from './product-voice.webp'
import productTcc from './product-tcc.webp'
import productMarathon from './product-marathon.webp'
import tileStudio from './tile-studio.webp'
import tileVoice from './tile-voice.webp'
import tileTcc from './tile-tcc.webp'
import tileMarathon from './tile-marathon.webp'
import tileStudioSm from './tile-studio-sm.webp'
import tileVoiceSm from './tile-voice-sm.webp'
import tileTccSm from './tile-tcc-sm.webp'
import tileMarathonSm from './tile-marathon-sm.webp'
import showcaseStudioUrl from './showcase-studio.webp'
import footerTextureUrl from './footer-texture.webp'
import ogBgUrl from './og-bg.webp'

export type ArtProductKey = 'studio' | 'voice' | 'tcc' | 'marathon'

/** 1600x1000 (16:10) product card art. */
export const productArt = {
  studio: productStudio,
  voice: productVoice,
  tcc: productTcc,
  marathon: productMarathon,
} as const satisfies Record<ArtProductKey, string>

/** 320x320 app-icon tiles (tile on white; for ~80px display at 4x / 160px at 2x). */
export const tileArt = {
  studio: tileStudio,
  voice: tileVoice,
  tcc: tileTcc,
  marathon: tileMarathon,
} as const satisfies Record<ArtProductKey, string>

/** 160x160 app-icon tiles (for ~80px display at 2x). */
export const tileArtSm = {
  studio: tileStudioSm,
  voice: tileVoiceSm,
  tcc: tileTccSm,
  marathon: tileMarathonSm,
} as const satisfies Record<ArtProductKey, string>

/** 1920x1080 (16:9) AI Creative Studio showcase panel. */
export const showcaseStudio: string = showcaseStudioUrl

/** 3200x520 warm newsprint texture for the giant footer wordmark fill. */
export const footerTexture: string = footerTextureUrl

/** 1200x630 social-card background (title is composed on top separately). */
export const ogBg: string = ogBgUrl
/** Alias of `ogBg`. */
export const ogBackground: string = ogBgUrl
