import { Server, type LucideIcon } from 'lucide-react'

import { productIcons } from '@/components/product/productIcons'
import { SITE_ORIGIN, productUrl } from '@/config/site'
import { products, serverHealth, type Accent } from '@/data/products'
import type { ServiceId } from '@/lib/health'

/** One row of the API catalogue: every product plus the shared gateway server. */
export interface ApiEntry {
  id: ServiceId
  name: string
  tagline: string
  description: string
  kind: 'console' | 'api'
  icon: LucideIcon
  accent?: Accent
  consoleUrl?: string
  consoleLabel?: string
  docsUrl?: string
  baseUrl: string
  healthPath: string
  healthUrl: string
  /** The health endpoint itself needs a session (401/403 = up). */
  authRequired: boolean
  /** The console asks people to sign in. */
  signInRequired: boolean
  /** Extra note about the API (e.g. "No public API"). */
  apiNote?: string
  /** False when the product has no public API (only a console and a health check). */
  publicApi: boolean
}

export const apiEntries: readonly ApiEntry[] = [
  ...products.map((p): ApiEntry => ({
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    kind: p.kind,
    icon: productIcons[p.id],
    accent: p.accent,
    consoleUrl: p.consoleUrl,
    consoleLabel: p.consoleLabel,
    docsUrl: p.docsUrl,
    baseUrl: p.apiBase,
    healthPath: p.healthPath,
    healthUrl: productUrl(p.healthPath),
    authRequired: p.authRequired,
    signInRequired: p.signInRequired,
    apiNote: p.apiNote,
    publicApi: p.publicApi,
  })),
  {
    id: 'server',
    name: serverHealth.name,
    tagline: 'The shared host behind every ET AI service',
    description:
      'The host that serves every product. Its health endpoint confirms the gateway itself is reachable before you debug a single service.',
    kind: 'api',
    icon: Server,
    baseUrl: new URL('/', SITE_ORIGIN).toString(),
    healthPath: serverHealth.healthPath,
    healthUrl: serverHealth.url,
    authRequired: false,
    signInRequired: false,
    publicApi: true,
  },
]

export const apiEntryIds = new Set<string>(apiEntries.map((e) => e.id))

export type ApiFilter = 'all' | 'console' | 'api'

/** Case-insensitive match on name, tagline, description or any URL. */
export function matchesQuery(entry: ApiEntry, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [
    entry.name,
    entry.tagline,
    entry.description,
    entry.baseUrl,
    entry.healthUrl,
    entry.consoleUrl,
    entry.docsUrl,
    entry.apiNote,
  ].some((field) => field?.toLowerCase().includes(q))
}

export function matchesFilter(entry: ApiEntry, filter: ApiFilter) {
  return filter === 'all' || entry.kind === filter
}
