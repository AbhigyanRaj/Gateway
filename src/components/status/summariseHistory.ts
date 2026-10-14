import type { HealthResult } from '@/lib/health'

/** Plain-language summary of a service's session history (for labels and panels). */
export function summariseHistory(history: readonly HealthResult[]) {
  const latencies = history
    .map((r) => r.latencyMs)
    .filter((n): n is number => n !== null)
    .sort((a, b) => a - b)
  const median = latencies.length ? latencies[Math.floor(latencies.length / 2)] : null
  const slowest = latencies.length ? latencies[latencies.length - 1] : null
  const ok = history.filter((r) => r.status === 'operational').length
  return { checks: history.length, ok, median, slowest }
}
