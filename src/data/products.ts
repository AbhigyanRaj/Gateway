import { productUrl } from '@/config/site'

export type ProductId = 'studio' | 'voice' | 'tcc' | 'marathon'
export type Accent = 'orange' | 'indigo' | 'green' | 'pink'

export interface Product {
  id: ProductId
  /** Display name. */
  name: string
  /** Short name for tight spaces (tabs, chips). */
  shortName: string
  /** One line, ~6–9 words — used in menus and mini cards. */
  tagline: string
  /** Two sentences max — used on cards and showcase panels. */
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
  /** Health-check path (relative — same-origin in production, proxied in dev). */
  healthPath: string
  /** The health endpoint requires a session; 401/403 means "up, sign-in required". */
  authRequired: boolean
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
    healthPath: '/studio/api/v1/',
    authRequired: true,
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
    authRequired: false,
  },
  {
    id: 'tcc',
    name: 'TCC Video Verification',
    shortName: 'Video Verification',
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
    authRequired: false,
  },
  {
    id: 'marathon',
    name: 'Marathon Chatbot',
    shortName: 'Marathon Chatbot',
    tagline: 'Answers grounded in a curated knowledge base',
    description:
      'A chat API that retrieves from a maintained knowledge base, so every answer is grounded in your content. Embed it anywhere.',
    capabilities: ['Retrieval over a knowledge base', 'Grounded, source-backed answers', 'Simple REST chat API'],
    kind: 'api',
    accent: 'pink',
    apiBase: productUrl('/marathon/'),
    healthPath: '/marathon/health',
    authRequired: false,
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
    text: string
    textStrong: string
    bgSoft: string
    border: string
    hoverIcon: string
    gradient: string
    gradientLight: string
    dot: string
  }
> = {
  orange: {
    text: 'text-orange-800',
    textStrong: 'text-orange-900',
    bgSoft: 'bg-orange-50',
    border: 'border-orange-200',
    hoverIcon: 'group-hover:text-hover-orange',
    gradient: 'bg-(image:--gradient-orange)',
    gradientLight: 'bg-(image:--gradient-orange-light)',
    dot: 'bg-orange-700',
  },
  indigo: {
    text: 'text-indigo-700',
    textStrong: 'text-indigo-900',
    bgSoft: 'bg-indigo-50',
    border: 'border-indigo-200',
    hoverIcon: 'group-hover:text-hover-indigo',
    gradient: 'bg-(image:--gradient-blue)',
    gradientLight: 'bg-(image:--gradient-blue-light)',
    dot: 'bg-indigo-600',
  },
  green: {
    text: 'text-green-700',
    textStrong: 'text-green-800',
    bgSoft: 'bg-green-50',
    border: 'border-green-200',
    hoverIcon: 'group-hover:text-hover-green',
    gradient: 'bg-(image:--gradient-green)',
    gradientLight: 'bg-(image:--gradient-green-light)',
    dot: 'bg-green-600',
  },
  pink: {
    text: 'text-pink-600',
    textStrong: 'text-pink-800',
    bgSoft: 'bg-pink-50',
    border: 'border-pink-200',
    hoverIcon: 'group-hover:text-hover-pink',
    gradient: 'bg-(image:--gradient-pink)',
    gradientLight: 'bg-(image:--gradient-pink-light)',
    dot: 'bg-pink-400',
  },
}
