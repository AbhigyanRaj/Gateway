import { StatusChip } from '@/components/product/StatusChip'
import type { ProductId } from '@/data/products'
import { useServiceHealth } from '@/hooks/useHealth'
import type { HealthStatus } from '@/lib/health'

function latencyLabel(ms: number | null | undefined) {
  if (ms === null || ms === undefined) return null
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`
}

/**
 * Live status chip + latency (and a short note, e.g. "Sign-in required").
 * Uses the shared StatusChip so tones match the rest of the page (AA on tint).
 */
export function ShowcaseStatus({ id }: { id: ProductId }) {
  const result = useServiceHealth(id)
  const status: HealthStatus = result?.status ?? 'checking'
  const latency = latencyLabel(result?.latencyMs)
  const meta = [latency, result?.note].filter(Boolean).join(' · ')

  return (
    <div className="flex min-h-7 flex-wrap items-center gap-x-3 gap-y-2">
      <StatusChip
        status={status}
        label={status === 'checking' ? 'Checking…' : undefined}
        pulse
        className="leading-5"
      />
      <span className="text-caption text-tx-tertiary tabular">
        {status === 'checking' ? 'Live check in progress' : meta || 'Live'}
      </span>
    </div>
  )
}
