// Generated artwork (see scripts/generate-art.mjs and scripts/optimize-art.mjs).
// Corners are square; apply the rounded radius in CSS.
import productStudio from './product-studio.webp'
import productVoice from './product-voice.webp'
import productMinicrm from './product-minicrm.webp'
import productLeadhub from './product-leadhub.webp'
import productTcc from './product-tcc.webp'
import productMarathon from './product-marathon.webp'
import productEditorialcrm from './product-editorialcrm.webp'
import productEditorialgate from './product-editorialgate.webp'
import tileStudio from './tile-studio.webp'
import tileVoice from './tile-voice.webp'
import tileMinicrm from './tile-minicrm.webp'
import tileLeadhub from './tile-leadhub.webp'
import tileTcc from './tile-tcc.webp'
import tileMarathon from './tile-marathon.webp'
import tileEditorialcrm from './tile-editorialcrm.webp'
import tileEditorialgate from './tile-editorialgate.webp'
import tileStudioSm from './tile-studio-sm.webp'
import tileVoiceSm from './tile-voice-sm.webp'
import tileMinicrmSm from './tile-minicrm-sm.webp'
import tileLeadhubSm from './tile-leadhub-sm.webp'
import tileTccSm from './tile-tcc-sm.webp'
import tileMarathonSm from './tile-marathon-sm.webp'
import tileEditorialcrmSm from './tile-editorialcrm-sm.webp'
import tileEditorialgateSm from './tile-editorialgate-sm.webp'
import tileStudioXs from './tile-studio-xs.webp'
import tileVoiceXs from './tile-voice-xs.webp'
import tileMinicrmXs from './tile-minicrm-xs.webp'
import tileLeadhubXs from './tile-leadhub-xs.webp'
import tileTccXs from './tile-tcc-xs.webp'
import tileMarathonXs from './tile-marathon-xs.webp'
import tileEditorialcrmXs from './tile-editorialcrm-xs.webp'
import tileEditorialgateXs from './tile-editorialgate-xs.webp'
import showcaseStudioUrl from './showcase-studio.webp'
import footerTextureUrl from './footer-texture.webp'
import ogBgUrl from './og-bg.webp'

export type ArtProductKey =
  | 'studio'
  | 'voice'
  | 'minicrm'
  | 'leadhub'
  | 'tcc'
  | 'marathon'
  | 'editorialcrm'
  | 'editorialgate'

/** 1600x1000 (16:10) product card art. */
export const productArt = {
  studio: productStudio,
  voice: productVoice,
  minicrm: productMinicrm,
  leadhub: productLeadhub,
  tcc: productTcc,
  marathon: productMarathon,
  editorialcrm: productEditorialcrm,
  editorialgate: productEditorialgate,
} as const satisfies Record<ArtProductKey, string>

/** 320x320 app-icon tiles on a transparent background (for ~80px display at 4x / 160px at 2x). */
export const tileArt = {
  studio: tileStudio,
  voice: tileVoice,
  minicrm: tileMinicrm,
  leadhub: tileLeadhub,
  tcc: tileTcc,
  marathon: tileMarathon,
  editorialcrm: tileEditorialcrm,
  editorialgate: tileEditorialgate,
} as const satisfies Record<ArtProductKey, string>

/** 160x160 app-icon tiles (for ~80px display at 2x). */
export const tileArtSm = {
  studio: tileStudioSm,
  voice: tileVoiceSm,
  minicrm: tileMinicrmSm,
  leadhub: tileLeadhubSm,
  tcc: tileTccSm,
  marathon: tileMarathonSm,
  editorialcrm: tileEditorialcrmSm,
  editorialgate: tileEditorialgateSm,
} as const satisfies Record<ArtProductKey, string>

/** 96x96 app-icon tiles (for 24-48px display). */
export const tileArtXs = {
  studio: tileStudioXs,
  voice: tileVoiceXs,
  minicrm: tileMinicrmXs,
  leadhub: tileLeadhubXs,
  tcc: tileTccXs,
  marathon: tileMarathonXs,
  editorialcrm: tileEditorialcrmXs,
  editorialgate: tileEditorialgateXs,
} as const satisfies Record<ArtProductKey, string>

/** 1920x1080 (16:9) AI Creative Studio showcase panel. */
export const showcaseStudio: string = showcaseStudioUrl

/** 3200x520 warm newsprint texture for the giant footer wordmark fill. */
export const footerTexture: string = footerTextureUrl

/** 1200x630 social-card background (title is composed on top separately). */
export const ogBg: string = ogBgUrl
/** Alias of `ogBg`. */
export const ogBackground: string = ogBgUrl
