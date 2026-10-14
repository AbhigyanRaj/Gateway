/** Origin that hosts every ET AI product (and this gateway, at its root). */
export const SITE_ORIGIN = 'https://etaiprod.indiatimes.com'

/** Absolute URL on the product origin, e.g. `productUrl('/studio/')`. */
export const productUrl = (path: string) => new URL(path, SITE_ORIGIN).toString()

export const site = {
  name: 'ET AI Labs',
  tagline: 'Every ET AI product, one front door.',
  description:
    'The gateway to ET AI Labs: AI Creative Studio, the AI Calling Bot, TCC Video Verification and the Marathon chatbot, with their APIs and live service status.',
  url: SITE_ORIGIN,
} as const

export const nav = [
  { label: 'Products', to: '/#products' },
  { label: 'APIs', to: '/apis' },
  { label: 'Status', to: '/status' },
] as const
