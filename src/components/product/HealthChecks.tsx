import { BadgeCheck, Info, X, type LucideIcon } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'

import { rowReveal } from '@/components/apis/RateAccordion'
import { Skeleton } from '@/components/ui/skeleton'
import type { HealthDetail, HealthResult } from '@/lib/health'
import { cn } from '@/lib/utils'

const okIcon: Record<
  'ok' | 'fail' | 'info',
  { icon: LucideIcon; className: string; label: string }
> = {
  ok: { icon: BadgeCheck, className: 'text-green-600', label: 'Passing' },
  fail: { icon: X, className: 'text-red-400', label: 'Failing' },
  info: { icon: Info, className: 'text-tx-tertiary', label: 'Info' },
}

/** Extra context for specific checks, keyed by `${serviceId}:${label}`. */
const notes: Record<string, string> = {
  'studio:API access': 'The API needs a signed-in session and returns 401 without one.',
}

export const checkGrid =
  'grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:gap-x-6'

/** One check: ok/fail/info icon, label (+ optional note) and the value. */
export function CheckRow({
  index,
  label,
  value,
  ok,
  note,
}: {
  index: number
  label: string
  value: ReactNode
  ok?: boolean
  note?: string
}) {
  const tone = okIcon[ok === undefined ? 'info' : ok ? 'ok' : 'fail']
  const Icon = tone.icon
  return (
    <div
      className={cn(checkGrid, rowReveal, 'min-h-12 px-5 py-3 sm:px-6 md:px-8')}
      style={{ '--i': index } as CSSProperties}
    >
      <dt className="flex min-w-0 gap-3">
        <span className="flex h-6 shrink-0 items-center">
          <Icon
            aria-hidden="true"
            strokeWidth={1.5}
            className={cn('size-[18px]', tone.className)}
          />
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-caption leading-6 font-medium text-tx md:text-body md:leading-6">
            {label}
            {ok !== undefined && <span className="sr-only"> ({tone.label.toLowerCase()})</span>}
          </span>
          {note && <span className="text-caption text-pretty text-tx-tertiary">{note}</span>}
        </span>
      </dt>
      <dd className="text-right text-caption leading-6 text-tx-secondary tabular md:text-left md:text-body md:leading-6">
        {value}
      </dd>
    </div>
  )
}

interface HealthChecksProps {
  result: HealthResult | undefined
  /** Rows appended after the curated checks (endpoint, session stats…). */
  children?: ReactNode
  className?: string
}

function fallbackRows(result: HealthResult): HealthDetail[] {
  if (result.status === 'down') {
    return [
      {
        label: 'Response',
        value: result.httpStatus ? `HTTP ${result.httpStatus}` : (result.note ?? 'No response'),
        ok: false,
      },
    ]
  }
  if (result.status === 'degraded') {
    return [{ label: 'Response', value: result.note ?? 'Unexpected response', ok: false }]
  }
  return [
    {
      label: 'Response',
      value: result.httpStatus ? `HTTP ${result.httpStatus} OK` : 'OK',
      ok: true,
    },
  ]
}

/**
 * The curated facts from a health payload (never keys or hostnames), as
 * rows with a passing / failing / informational icon.
 */
export function HealthChecks({ result, children, className }: HealthChecksProps) {
  if (!result) {
    return (
      <div
        className={cn('flex flex-col gap-3 px-5 py-4 sm:px-6 md:px-8', className)}
        aria-busy="true"
      >
        <span className="sr-only">Checking…</span>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-5 w-full max-w-md rounded-md bg-sf-tertiary" />
        ))}
      </div>
    )
  }

  const rows = result.details.length ? result.details : fallbackRows(result)
  return (
    <dl className={cn('divide-y divide-st-secondary', className)}>
      {rows.map((row, i) => (
        <CheckRow
          key={row.label}
          index={i}
          label={row.label}
          value={row.value}
          ok={row.ok}
          note={notes[`${result.id}:${row.label}`]}
        />
      ))}
      {children}
    </dl>
  )
}
