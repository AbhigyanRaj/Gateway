import { summariseHistory } from '@/components/status/summariseHistory'
import { useHealthHistory } from '@/hooks/useHealth'
import { formatLatency } from '@/lib/format'
import {
  historyStore,
  statusCopy,
  type HealthResult,
  type HealthStatus,
  type ServiceId,
} from '@/lib/health'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

/** Latency at or above this fills the bar; below it the bar scales linearly. */
const CAP_MS = 1200
const MIN_HEIGHT = 0.22

const barTone: Record<HealthStatus, string> = {
  operational: 'bg-green-500',
  degraded: 'bg-yellow-500',
  down: 'bg-red-400',
  checking: 'bg-grey-300',
}

function barHeight(r: HealthResult) {
  if (r.status === 'down' || r.latencyMs === null) return 1
  return MIN_HEIGHT + ((1 - MIN_HEIGHT) * Math.min(r.latencyMs, CAP_MS)) / CAP_MS
}

function clock(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

interface LatencyStripProps {
  id: ServiceId
  /** Hide from assistive tech (e.g. when the strip sits inside a button). */
  decorative?: boolean
  className?: string
}

/**
 * Thin rounded bars for the last 30 checks this session: height follows
 * latency (clamped), colour follows status. Newest on the right; empty
 * slots stay grey until the session fills them.
 */
export function LatencyStrip({ id, decorative = false, className }: LatencyStripProps) {
  const history = useHealthHistory(id)
  const empty = Math.max(0, historyStore.limit - history.length)
  const { checks, median } = summariseHistory(history)
  const label = checks
    ? `Response time this session: ${checks} ${checks === 1 ? 'check' : 'checks'}, median ${formatLatency(median)}`
    : 'Response time this session: no checks yet'

  return (
    <span
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label })}
      className={cn(
        'flex h-7 min-w-0 items-end justify-end gap-px overflow-hidden sm:gap-[2px] xl:justify-start xl:gap-[3px]',
        className,
      )}
    >
      {Array.from({ length: empty }, (_, i) => (
        <span
          key={`empty-${i}`}
          className="max-w-1 min-w-px flex-1 rounded-full bg-grey-300"
          style={{ height: `${MIN_HEIGHT * 100}%` }}
        />
      ))}
      {history.map((r) => (
        <Tooltip key={r.checkedAt}>
          <TooltipTrigger asChild>
            <span
              className={cn(
                'max-w-1 min-w-px flex-1 origin-bottom rounded-full transition-[height,background-color,scale] duration-500 ease-standard starting:scale-y-0',
                barTone[r.status],
              )}
              style={{ height: `${barHeight(r) * 100}%` }}
            />
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6} className="font-sans text-label tabular">
            <span className="text-white/70">{clock(r.checkedAt)}</span>
            {' · '}
            {r.latencyMs === null ? (r.note ?? 'No response') : formatLatency(r.latencyMs)}
            {' · '}
            {statusCopy[r.status].label}
          </TooltipContent>
        </Tooltip>
      ))}
    </span>
  )
}
