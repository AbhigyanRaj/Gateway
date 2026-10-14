import { products, serverHealth, type ProductId } from '@/data/products'

export type ServiceId = ProductId | 'server'
export type HealthStatus = 'operational' | 'degraded' | 'down' | 'checking'

export interface HealthDetail {
  label: string
  value: string
  /** true = healthy, false = failing, undefined = informational. */
  ok?: boolean
}

export interface HealthResult {
  id: ServiceId
  status: HealthStatus
  /** HTTP status code, or null on network error / timeout. */
  httpStatus: number | null
  latencyMs: number | null
  checkedAt: number
  /** Curated, user-safe facts from the health payload (never keys or hostnames). */
  details: HealthDetail[]
  /** Short human note, e.g. "Sign-in required" or "Timed out". */
  note?: string
}

export interface Service {
  id: ServiceId
  name: string
  healthPath: string
  healthKind: 'json' | 'page'
  authRequired: boolean
}

/** Every checked service, AI Creative Studio first, shared server last. */
export const services: readonly Service[] = [
  ...products.map((p) => ({
    id: p.id,
    name: p.name,
    healthPath: p.healthPath,
    healthKind: p.healthKind,
    authRequired: p.authRequired,
  })),
  {
    id: 'server',
    name: serverHealth.name,
    healthPath: serverHealth.healthPath,
    healthKind: 'json',
    authRequired: false,
  },
]

export const TIMEOUT_MS = 8000
export const SLOW_MS = 2500
export const POLL_MS = 30_000

type Json = Record<string, unknown>
const isObj = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v)
const yes = (ok: boolean) => (ok ? 'Healthy' : 'Not ready')

/** Pick only safe, meaningful facts from each payload. */
function curate(id: ServiceId, body: unknown, httpStatus: number): HealthDetail[] {
  if (id === 'studio') {
    const up = httpStatus >= 200 && httpStatus < 400
    return [
      { label: 'Console', value: up ? 'Serving' : 'Not responding', ok: up },
      { label: 'API access', value: 'Sign-in required' },
    ]
  }
  if (!isObj(body)) return []
  if (id === 'minicrm') {
    const version = typeof body.version === 'string' ? body.version : null
    return [
      { label: 'API', value: yes(body.ok === true), ok: body.ok === true },
      ...(version ? [{ label: 'Version', value: version }] : []),
    ]
  }
  if (id === 'leadhub') {
    return [{ label: 'App server', value: yes(body.ok === true), ok: body.ok === true }]
  }
  if (id === 'voice' && isObj(body.checks)) {
    const c = body.checks
    return [
      { label: 'Database', value: yes(c.database === 'ok'), ok: c.database === 'ok' },
      {
        label: 'Telephony',
        value: yes(c.telephony_configured === true),
        ok: c.telephony_configured === true,
      },
      { label: 'CRM sync', value: yes(c.crm_configured === true), ok: c.crm_configured === true },
    ]
  }
  if (id === 'tcc') {
    const stt = isObj(body.stt) ? body.stt : {}
    const judge = typeof body.judge_model === 'string' && body.judge_model.length > 0
    return [
      { label: 'Speech-to-text', value: yes(stt.configured === true), ok: stt.configured === true },
      { label: 'AI judge', value: yes(judge), ok: judge },
      {
        label: 'Media processing',
        value: yes(typeof body.ffmpeg === 'string'),
        ok: typeof body.ffmpeg === 'string',
      },
    ]
  }
  if (id === 'marathon') {
    const sections = typeof body.kb_sections === 'number' ? body.kb_sections : null
    const age = typeof body.kb_age_hours === 'number' ? body.kb_age_hours : null
    return [
      {
        label: 'Knowledge base',
        value: sections === null ? 'Unknown' : `${sections} sections`,
        ok: sections !== null && sections > 0,
      },
      {
        label: 'Last refreshed',
        value: age === null ? 'Unknown' : age < 1 ? 'Within the hour' : `${Math.round(age)}h ago`,
      },
      {
        label: 'Retrieval',
        value: yes(typeof body.retriever === 'string'),
        ok: typeof body.retriever === 'string',
      },
    ]
  }
  return []
}

/** Dev-only failure simulation for QA: `?simulate=voice:down,tcc:degraded`. */
function simulated(id: ServiceId): HealthStatus | null {
  if (!import.meta.env.DEV || typeof window === 'undefined') return null
  const raw = new URLSearchParams(window.location.search).get('simulate')
  if (!raw) return null
  for (const pair of raw.split(',')) {
    const [sid, status] = pair.split(':')
    if (sid === id && (status === 'down' || status === 'degraded')) return status
  }
  return null
}

export async function checkService(service: Service, signal?: AbortSignal): Promise<HealthResult> {
  const sim = simulated(service.id)
  if (sim) {
    await new Promise((r) => setTimeout(r, 300))
    return {
      id: service.id,
      status: sim,
      httpStatus: sim === 'down' ? 503 : 200,
      latencyMs: sim === 'down' ? null : 3120,
      checkedAt: Date.now(),
      details: [],
      note: sim === 'down' ? 'Service unavailable' : 'Responding slowly',
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort)
  const started = performance.now()

  try {
    const res = await fetch(service.healthPath, {
      cache: 'no-store',
      credentials: 'omit',
      headers: { Accept: service.healthKind === 'page' ? 'text/html' : 'application/json' },
      signal: controller.signal,
    })
    const latencyMs = Math.round(performance.now() - started)
    let body: unknown = null
    if (service.healthKind === 'json') {
      try {
        body = await res.json()
      } catch {
        body = null
      }
    } else {
      // Drain the page body without parsing it.
      await res.arrayBuffer().catch(() => undefined)
    }

    const authGate = service.authRequired && (res.status === 401 || res.status === 403)
    const ok =
      service.healthKind === 'page'
        ? res.ok
        : res.ok && isObj(body) && (body.status === 'ok' || body.ok === true)
    let status: HealthStatus
    let note: string | undefined
    if (authGate) {
      status = 'operational'
      note = 'Sign-in required'
    } else if (ok) {
      status = 'operational'
    } else if (res.ok) {
      status = 'degraded'
      note = 'Unexpected response'
    } else if (res.status >= 500) {
      status = 'down'
      note = `HTTP ${res.status}`
    } else {
      status = 'degraded'
      note = `HTTP ${res.status}`
    }
    if (status === 'operational' && latencyMs > SLOW_MS) {
      status = 'degraded'
      note = 'Responding slowly'
    }

    return {
      id: service.id,
      status,
      httpStatus: res.status,
      latencyMs,
      checkedAt: Date.now(),
      details: curate(service.id, body, res.status),
      note,
    }
  } catch (error) {
    // Cancelled by the caller (React Query unmount/refetch): not a real result.
    // Rethrow so it is discarded and never recorded as an outage.
    if (signal?.aborted) throw error
    const timedOut = performance.now() - started >= TIMEOUT_MS - 50
    return {
      id: service.id,
      status: 'down',
      httpStatus: null,
      latencyMs: null,
      checkedAt: Date.now(),
      details: [],
      note: timedOut ? 'Timed out' : 'Unreachable',
    }
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}

export interface HealthAggregate {
  status: HealthStatus
  up: number
  total: number
  /** Median latency across services that responded, in ms. */
  medianLatencyMs: number | null
  /** Most recent check time across all services. */
  lastCheckedAt: number | null
}

export function aggregate(results: (HealthResult | undefined)[]): HealthAggregate {
  const total = results.length
  const done = results.filter((r): r is HealthResult => !!r)
  const up = done.filter((r) => r.status === 'operational').length
  const latencies = done
    .map((r) => r.latencyMs)
    .filter((n): n is number => n !== null)
    .sort((a, b) => a - b)
  const mid = Math.floor(latencies.length / 2)
  const medianLatencyMs =
    latencies.length === 0
      ? null
      : latencies.length % 2
        ? latencies[mid]
        : Math.round((latencies[mid - 1] + latencies[mid]) / 2)

  let status: HealthStatus = 'checking'
  if (done.length === total && total > 0) {
    if (done.some((r) => r.status === 'down')) status = 'down'
    else if (done.some((r) => r.status === 'degraded')) status = 'degraded'
    else status = 'operational'
  }
  const lastCheckedAt = done.length ? Math.max(...done.map((r) => r.checkedAt)) : null
  return { status, up, total, medianLatencyMs, lastCheckedAt }
}

export const statusCopy: Record<HealthStatus, { label: string; summary: string }> = {
  operational: { label: 'Operational', summary: 'All systems operational' },
  degraded: { label: 'Degraded', summary: 'Some systems degraded' },
  down: { label: 'Down', summary: 'Partial outage' },
  checking: { label: 'Checking', summary: 'Checking systems' },
}

/* ---------- Session history (in-memory; powers the /status latency strip) ---------- */

const HISTORY_LIMIT = 30
const history = new Map<ServiceId, HealthResult[]>()
const listeners = new Set<() => void>()
let version = 0

export function recordResult(result: HealthResult) {
  const list = history.get(result.id) ?? []
  const next = [...list, result].slice(-HISTORY_LIMIT)
  history.set(result.id, next)
  version++
  listeners.forEach((l) => l())
}

export const historyStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getVersion: () => version,
  get: (id: ServiceId): readonly HealthResult[] => history.get(id) ?? [],
  limit: HISTORY_LIMIT,
}
