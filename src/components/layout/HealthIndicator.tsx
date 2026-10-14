import type { HealthStatus } from '@/lib/health'
import { statusCopy } from '@/lib/health'
import { cn } from '@/lib/utils'

/** Text colour drives both the dot (bg-current) and its pulse ring (currentColor). */
const tone: Record<HealthStatus, string> = {
  operational: 'text-green-500',
  degraded: 'text-yellow-500',
  down: 'text-red-400',
  checking: 'text-grey-500',
}

/**
 * Small live status dot for the aggregate service health. Pulses only while
 * everything is operational. Includes a visually hidden label unless
 * `label={false}` (when adjacent text already says the status).
 */
export function HealthDot({
  status,
  className,
  label = true,
}: {
  status: HealthStatus
  className?: string
  label?: boolean
}) {
  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          'inline-block size-1.5 shrink-0 rounded-full bg-current transition-colors duration-300',
          tone[status],
          status === 'operational' && 'animate-pulse-dot',
          className,
        )}
      />
      {label && <span className="sr-only">{`(${statusCopy[status].summary})`}</span>}
    </>
  )
}
