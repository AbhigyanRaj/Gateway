import { productUrl } from '@/config/site'

export type ProductId = 'studio' | 'voice' | 'minicrm' | 'leadhub' | 'tcc' | 'marathon'
export type Accent = 'orange' | 'indigo' | 'yellow' | 'red' | 'green' | 'pink'

export interface Product {
  id: ProductId
  /** Display name. */
  name: string
  /** Short name for tight spaces (tabs, chips). */
  shortName: string
  /** One line, about 6 to 9 words, used in menus and mini cards. */
  tagline: string
  /** Two sentences max, used on cards and showcase panels. */
  description: string
  /** Three short capability bullets. */
  capabilities: [string, string, string]
  /** 'console' products have a UI to open; 'api' products are API-only. */
  kind: 'console' | 'api'
  accent: Accent
  /** Console / app URL (absolute). Absent for API-only products. */
  consoleUrl?: string
  /** What the console button says. */
  consoleLabel?: string
  /** Documentation URL (absolute), if any. */
  docsUrl?: string
  /** API base URL (absolute). */
  apiBase: string
  /** Health-check path (relative: same-origin in production, proxied in dev). */
  healthPath: string
  /** 'json' = health JSON ({status:'ok'} or {ok:true}); 'page' = app page answers 200. */
  healthKind: 'json' | 'page'
  /** The health endpoint requires a session; 401/403 means "up, sign-in required". */
  authRequired: boolean
  /** The console asks users to sign in. */
  signInRequired: boolean
  /** The product exposes a documented public API (false = web app only). */
  publicApi: boolean
  /** Extra note about the API, shown on /apis. */
  apiNote?: string
}

/**
 * Single source of truth for every product. Order matters: AI Creative Studio
 * is always first.
 */
export const products: readonly Product[] = [
  {
    id: 'studio',
    name: 'AI Creative Studio',
    shortName: 'Creative Studio',
    tagline: 'Generate on-brand images and creatives with AI',
    description:
      'Turn a brief into publish-ready visuals. Generate, refine and export creatives for stories, social and campaigns in one workspace.',
    capabilities: ['Prompt-to-image generation', 'Edit and refine variations', 'Export for every format'],
    kind: 'console',
    accent: 'orange',
    consoleUrl: productUrl('/studio/'),
    consoleLabel: 'Open Studio',
    apiBase: productUrl('/studio/api/v1/'),
    healthPath: '/studio/',
    healthKind: 'page',
    authRequired: false,
    signInRequired: true,
    publicApi: true,
    apiNote: 'Requires a signed-in session (returns 401 without one).',
  },
  {
    id: 'voice',
    name: 'AI Calling Bot',
    shortName: 'Calling Bot',
    tagline: 'Voice agents that call, converse and log to CRM',
    description:
      'Run natural phone conversations at scale. Configure agents, place calls over telephony and sync every outcome to your CRM.',
    capabilities: ['Outbound and inbound calls', 'Telephony and CRM built in', 'Call logs and outcomes'],
    kind: 'console',
    accent: 'indigo',
    consoleUrl: productUrl('/voice/'),
    consoleLabel: 'Open console',
    apiBase: productUrl('/voice/api/'),
    healthPath: '/voice/api/health',
    healthKind: 'json',
    authRequired: false,
    signInRequired: true,
    publicApi: true,
  },
  {
    id: 'minicrm',
    name: 'MiniCRM',
    shortName: 'MiniCRM',
    tagline: 'Track every lead through to conversion',
    description:
      'A focused CRM for sales teams. Work the pipeline, schedule follow-ups and see every conversion in one console.',
    capabilities: ['Pipeline and lead tracking', 'Follow-ups and conversion stages', 'Secure team sign-in'],
    kind: 'console',
    accent: 'yellow',
    consoleUrl: productUrl('/minicrm/'),
    consoleLabel: 'Open MiniCRM',
    apiBase: productUrl('/minicrm/api/'),
    healthPath: '/minicrm/api/health',
    healthKind: 'json',
    authRequired: false,
    signInRequired: true,
    publicApi: true,
  },
  {
    id: 'leadhub',
    name: 'LeadHub',
    shortName: 'LeadHub',
    tagline: 'Capture, qualify and route new leads',
    description:
      'Where new business comes in. Capture leads from every source, qualify them and hand each one to the right team.',
    capabilities: ['Lead capture from every source', 'Qualification and scoring', 'Routing to the right team'],
    kind: 'console',
    accent: 'red',
    consoleUrl: productUrl('/leadhub/'),
    consoleLabel: 'Open LeadHub',
    apiBase: productUrl('/leadhub/'),
    healthPath: '/leadhub/healthz',
    healthKind: 'json',
    authRequired: false,
    signInRequired: true,
    publicApi: false,
    apiNote: 'Web app with a public health check. No public API.',
  },
  {
    id: 'tcc',
    name: 'TCC Video Verification',
    shortName: 'Video Verify',
    tagline: 'Check videos with speech recognition and an AI judge',
    description:
      'Upload a video and get a verdict. Speech is transcribed with language detection, then an AI judge checks it against your rules.',
    capabilities: ['Multilingual speech-to-text', 'AI judge with clear verdicts', 'Tester console and API docs'],
    kind: 'console',
    accent: 'green',
    consoleUrl: productUrl('/tcc/'),
    consoleLabel: 'Open tester',
    docsUrl: productUrl('/tcc/docs'),
    apiBase: productUrl('/tcc/'),
    healthPath: '/tcc/health',
    healthKind: 'json',
    authRequired: false,
    signInRequired: false,
    publicApi: true,
  },
  {
    id: 'marathon',
    name: 'Marathon Chatbot',
    shortName: 'Marathon',
    tagline: 'Answers grounded in a curated knowledge base',
    description:
      'A chat API that retrieves from a maintained knowledge base, so every answer is grounded in your content. Embed it anywhere.',
    capabilities: ['Retrieval over a knowledge base', 'Grounded, source-backed answers', 'Simple REST chat API'],
    kind: 'api',
    accent: 'pink',
    apiBase: productUrl('/marathon/'),
    healthPath: '/marathon/health',
    healthKind: 'json',
    authRequired: false,
    signInRequired: false,
    publicApi: true,
  },
] as const

export const productById = Object.fromEntries(products.map((p) => [p.id, p])) as Record<
  ProductId,
  Product
>

/** The shared server health endpoint (not a product). */
export const serverHealth = {
  id: 'server',
  name: 'Gateway server',
  healthPath: '/health',
  url: productUrl('/health'),
} as const

/** Accent → Tailwind class fragments. Literal strings so Tailwind can see them. */
export const accentStyles: Record<
  Accent,
  {
    /** Readable accent text (eyebrows, labels). */
    text: string
    textStrong: string
    /** Accent-coloured icon (line icons on white). */
    icon: string
    bgSoft: string
    border: string
    /** Icon tint on hover inside a `group`. */
    hoverIcon: string
    gradient: string
    gradientLight: string
    dot: string
    /** Raw hex for SVG/inline use. */
    hex: string
  }
> = {
  orange: {
    text: 'text-orange-800',
    textStrong: 'text-orange-900',
    icon: 'text-orange-700',
    bgSoft: 'bg-orange-50',
    border: 'border-orange-200',
    hoverIcon: 'group-hover:text-hover-orange',
    gradient: 'bg-(image:--gradient-orange)',
    gradientLight: 'bg-(image:--gradient-orange-light)',
    dot: 'bg-orange-700',
    hex: '#ee7944',
  },
  indigo: {
    text: 'text-indigo-700',
    textStrong: 'text-indigo-900',
    icon: 'text-indigo-600',
    bgSoft: 'bg-indigo-50',
    border: 'border-indigo-200',
    hoverIcon: 'group-hover:text-hover-indigo',
    gradient: 'bg-(image:--gradient-blue)',
    gradientLight: 'bg-(image:--gradient-blue-light)',
    dot: 'bg-indigo-600',
    hex: '#556adc',
  },
  yellow: {
    text: 'text-yellow-800',
    textStrong: 'text-yellow-900',
    icon: 'text-yellow-700',
    bgSoft: 'bg-yellow-50',
    border: 'border-yellow-200',
    hoverIcon: 'group-hover:text-hover-yellow',
    gradient: 'bg-(image:--gradient-yellow)',
    gradientLight: 'bg-(image:--gradient-yellow-light)',
    dot: 'bg-yellow-600',
    hex: '#df9c2a',
  },
  red: {
    text: 'text-red-400',
    textStrong: 'text-red-600',
    icon: 'text-red-300',
    bgSoft: 'bg-red-50',
    border: 'border-red-200',
    hoverIcon: 'group-hover:text-hover-red',
    gradient: 'bg-(image:--gradient-red)',
    gradientLight: 'bg-(image:--gradient-red-light)',
    dot: 'bg-red-300',
    hex: '#db715c',
  },
  green: {
    text: 'text-green-700',
    textStrong: 'text-green-800',
    icon: 'text-green-600',
    bgSoft: 'bg-green-50',
    border: 'border-green-200',
    hoverIcon: 'group-hover:text-hover-green',
    gradient: 'bg-(image:--gradient-green)',
    gradientLight: 'bg-(image:--gradient-green-light)',
    dot: 'bg-green-600',
    hex: '#6ea335',
  },
  pink: {
    text: 'text-pink-600',
    textStrong: 'text-pink-800',
    icon: 'text-pink-400',
    bgSoft: 'bg-pink-50',
    border: 'border-pink-200',
    hoverIcon: 'group-hover:text-hover-pink',
    gradient: 'bg-(image:--gradient-pink)',
    gradientLight: 'bg-(image:--gradient-pink-light)',
    dot: 'bg-pink-400',
    hex: '#d4508e',
  },
}

