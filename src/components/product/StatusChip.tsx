import { statusCopy, type HealthStatus } from '@/lib/health'
import { cn } from '@/lib/utils'

/**
 * Status colours follow the kit's compliance-badge recipe (tinted fill, tinted
 * border, inner bottom glow). Text steps are one notch deeper than the kit so
 * every label clears WCAG AA on its tint; the dot carries the vivid tone.
 */
const chipTone: Record<HealthStatus, string> = {
  operational:
    'text-green-700 bg-green-50/75 border-green-200/75 shadow-[inset_0_-0.5px_1px_0_var(--color-green-200)]',
  degraded:
    'text-yellow-900 bg-yellow-50 border-yellow-200/90 shadow-[inset_0_-0.5px_1px_0_var(--color-yellow-200)]',
  down: 'text-red-500 bg-red-50 border-red-200/50 shadow-[inset_0_-0.5px_1px_0_var(--color-red-100)]',
  checking:
    'text-indigo-600 bg-indigo-50 border-indigo-200/75 shadow-[inset_0_-0.5px_1px_0_var(--color-indigo-200)]',
}

/** Vivid dot colour per status (set as currentColor so the pulse ring matches). */
const dotTone: Record<HealthStatus, string> = {
  operational: 'text-green-500',
  degraded: 'text-yellow-500',
  down: 'text-red-400',
  checking: 'text-indigo-400',
}

const chipSize = {
  sm: 'gap-1.5 rounded-lg px-2 py-0.5 text-[13px] leading-5',
  md: 'gap-2 rounded-xl px-2.5 py-1 text-caption',
} as const

interface StatusDotProps {
  status: HealthStatus
  /** Pulse a soft ring (operational only). */
  pulse?: boolean
  /** Screen-reader text. Defaults to the status label, e.g. "Operational". */
  label?: string
  className?: string
}

/** A 6px live status dot with screen-reader text. */
export function StatusDot({ status, pulse = false, label, className }: StatusDotProps) {
  return (
    <span className={cn('relative inline-flex size-1.5 shrink-0', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'size-full rounded-full bg-current',
          dotTone[status],
          pulse && status === 'operational' && 'animate-pulse-dot',
          status === 'checking' && 'animate-pulse',
        )}
      />
      <span className="sr-only">{label ?? statusCopy[status].label}</span>
    </span>
  )
}

interface StatusChipProps {
  status: HealthStatus
  /** Visible label. Defaults to `statusCopy[status].label`. */
  label?: string
  size?: 'sm' | 'md'
  /** Pulse the dot when operational. */
  pulse?: boolean
  className?: string
}

/** Tinted status chip: leading dot + label (kit compliance-badge recipe). */
export function StatusChip({
  status,
  label,
  size = 'md',
  pulse = false,
  className,
}: StatusChipProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center border font-semibold whitespace-nowrap',
        'transition-colors duration-200 ease-standard',
        chipTone[status],
        chipSize[size],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'size-1.5 shrink-0 rounded-full bg-current',
          dotTone[status],
          pulse && status === 'operational' && 'animate-pulse-dot',
          status === 'checking' && 'animate-pulse',
        )}
      />
      <span className="sr-only">Status: </span>
      {label ?? statusCopy[status].label}
    </span>
  )
}
