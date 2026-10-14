import { useServiceHealth } from '@/hooks/useHealth'
import { statusCopy, type HealthStatus } from '@/lib/health'
import type { ProductId } from '@/data/products'
import { cn } from '@/lib/utils'

/** Kit compliance-badge recipe, one tone per health status. */
const chipTone: Record<HealthStatus, string> = {
  operational:
    'text-green-600 bg-green-50/75 border-green-200/75 shadow-[inset_0_-0.5px_1px_0_var(--color-green-200)]',
  degraded:
    'text-yellow-700 bg-yellow-50 border-yellow-200/90 shadow-[inset_0_-0.5px_1px_0_var(--color-yellow-200)]',
  down: 'text-red-400 bg-red-50 border-red-200/50 shadow-[inset_0_-0.5px_1px_0_var(--color-red-100)]',
  checking:
    'text-indigo-600 bg-indigo-50 border-indigo-200/75 shadow-[inset_0_-0.5px_1px_0_var(--color-indigo-200)]',
}

function latencyLabel(ms: number | null | undefined) {
  if (ms === null || ms === undefined) return null
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`
}

/** Live status chip + latency (and a short note, e.g. "Sign-in required"). */
export function ShowcaseStatus({ id }: { id: ProductId }) {
  const result = useServiceHealth(id)
  const status: HealthStatus = result?.status ?? 'checking'
  const latency = latencyLabel(result?.latencyMs)
  const meta = [latency, result?.note].filter(Boolean).join(' · ')

  return (
    <div className="flex min-h-7 flex-wrap items-center gap-x-3 gap-y-2">
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-caption leading-5 font-semibold',
          chipTone[status],
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'size-1.5 rounded-full bg-current',
            status === 'operational' && 'animate-pulse-dot',
          )}
        />
        {status === 'checking' ? 'Checking…' : statusCopy[status].label}
      </span>
      <span className="text-caption text-tx-tertiary tabular">
        {status === 'checking' ? 'Live check in progress' : meta || 'Live'}
      </span>
    </div>
  )
}
