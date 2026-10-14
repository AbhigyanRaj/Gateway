/** "just now", "12s ago", "3m ago". */
export function timeAgo(ts: number | null | undefined, now = Date.now()): string {
  if (!ts) return 'not yet'
  const s = Math.max(0, Math.round((now - ts) / 1000))
  if (s < 5) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.round(m / 60)}h ago`
}

/** "182 ms", "2.4 s", or "n/a". */
export function formatLatency(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return 'n/a'
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`
}

/** Strip protocol for compact display: "etaiprod.indiatimes.com/voice/api/". */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, '')
}
