import { BadgeCheck } from 'lucide-react'

import {
  openTone,
  RateAccordion,
  RateChevron,
  RateContent,
  RateHead,
  RateItem,
  RateTrigger,
} from '@/components/apis/RateAccordion'
import type { ApiEntry } from '@/components/apis/entries'
import { ServiceTile } from '@/components/apis/ServiceTile'
import { CopyActions } from '@/components/product/CopyField'
import { CheckRow, HealthChecks } from '@/components/product/HealthChecks'
import { LatencyStrip } from '@/components/product/LatencyStrip'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useHealthHistory } from '@/hooks/useHealth'
import { formatLatency } from '@/lib/format'
import type { HealthResult, ServiceId } from '@/lib/health'
import { cn } from '@/lib/utils'

import { Ago } from './Ago'
import { summariseHistory } from './summariseHistory'
import { StatusChip } from '@/components/product/StatusChip'

/**
 * Columns. Mobile: [tile][name][chevron] then chip + strip + latency below.
 * sm: chip joins the first line. xl: one line, strip and latency in columns.
 */
const rowGrid =
  'grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto_auto] xl:grid-cols-[2.5rem_minmax(0,1fr)_15.5rem_6.5rem_8.5rem_1rem] xl:gap-x-6'

function Latency({ result, className }: { result: HealthResult | undefined; className?: string }) {
  return (
    <span
      className={cn(
        'flex shrink-0 flex-col items-end leading-tight tabular sm:flex-row sm:items-baseline sm:gap-2 xl:flex-col xl:items-start xl:gap-0',
        className,
      )}
    >
      <span className="text-caption font-medium text-tx md:text-body">
        {result ? formatLatency(result.latencyMs) : '…'}
      </span>
      <span className="font-mono text-label text-tx-tertiary">
        {result
          ? result.httpStatus === null
            ? 'no reply'
            : `HTTP ${result.httpStatus}`
          : 'checking'}
      </span>
    </span>
  )
}

function SessionStats({ id }: { id: ServiceId }) {
  const { checks, ok, median, slowest } = summariseHistory(useHealthHistory(id))
  if (!checks) return <>No checks yet</>
  return (
    <>
      {checks} {checks === 1 ? 'check' : 'checks'} · {ok} operational · median{' '}
      {formatLatency(median)}
      {checks > 1 && <> · slowest {formatLatency(slowest)}</>}
    </>
  )
}

function Panel({ entry, result }: { entry: ApiEntry; result: HealthResult | undefined }) {
  const curated = result ? Math.max(result.details.length, 1) : 0
  return (
    <>
      <RateHead className="grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] pl-[3.75rem] md:pl-[4.25rem]">
        <span>Check</span>
        <span>Result</span>
      </RateHead>
      <HealthChecks result={result}>
        <CheckRow
          index={curated}
          label="Endpoint"
          value={
            <span className="inline-flex items-center gap-1 md:-my-1">
              <code className="font-mono text-[13px] text-tx md:text-sm">{entry.healthPath}</code>
              <CopyActions label={`${entry.name} health URL`} value={entry.healthUrl} />
            </span>
          }
        />
        <CheckRow index={curated + 1} label="This session" value={<SessionStats id={entry.id} />} />
        <CheckRow
          index={curated + 2}
          label="Last checked"
          value={result ? <Ago ts={result.checkedAt} /> : 'Checking now…'}
        />
      </HealthChecks>
    </>
  )
}

interface StatusTableProps {
  entries: readonly ApiEntry[]
  results: Record<ServiceId, HealthResult | undefined>
  open: readonly string[]
  onOpenChange: (open: string[]) => void
  /** Shown instead of rows when the filter leaves nothing. */
  emptyLabel: string
  className?: string
}

/** Services table (rate-table accordion + cowork table rows). */
export function StatusTable({
  entries,
  results,
  open,
  onOpenChange,
  emptyLabel,
  className,
}: StatusTableProps) {
  return (
    // The latency bars carry tooltips; the provider lives here so the tooltip
    // code ships with this page rather than the main bundle.
    <TooltipProvider delayDuration={200}>
      <RateAccordion value={open} onValueChange={onOpenChange} className={className}>
        <div
          aria-hidden="true"
          className={cn(
            rowGrid,
            'hidden border-b border-st-secondary bg-sf-secondary/40 px-8 py-2.5 font-mono text-label tracking-[0.08em] text-tx-tertiary uppercase xl:grid',
          )}
        >
          <span className="col-span-2">Service</span>
          <span>Response time · this session</span>
          <span>Latency</span>
          <span>Status</span>
          <span />
        </div>

        {entries.length === 0 && (
          <p className="flex min-h-20 items-center justify-center gap-2.5 px-6 py-6 text-body text-tx-secondary">
            <BadgeCheck aria-hidden="true" strokeWidth={1.5} className="size-5 text-green-600" />
            {emptyLabel}
          </p>
        )}

        {entries.map((entry) => {
          const result = results[entry.id]
          const status = result?.status ?? 'checking'
          return (
            <RateItem key={entry.id} id={entry.id}>
              <RateTrigger className={rowGrid}>
                <span className="col-start-1 row-start-1">
                  <ServiceTile id={entry.id} size={40} />
                </span>
                <span className="col-start-2 row-start-1 flex min-w-0 flex-col">
                  <span
                    className={cn(
                      'truncate text-body leading-snug font-medium tracking-[-0.01em] md:text-lg',
                      openTone,
                    )}
                  >
                    {entry.name}
                  </span>
                  <code className="truncate font-mono text-[13px] leading-5 text-tx-tertiary">
                    {entry.healthPath}
                  </code>
                </span>
                <StatusChip
                  status={status}
                  size="sm"
                  className="col-start-3 row-start-1 hidden justify-self-end sm:inline-flex xl:col-start-5 xl:justify-self-start"
                />
                <RateChevron className="col-start-3 row-start-1 justify-self-end sm:col-start-4 xl:col-start-6" />
                <span className="col-span-full row-start-2 flex min-w-0 items-center gap-3 sm:col-start-2 sm:col-end-[-1] xl:contents">
                  <StatusChip status={status} size="sm" className="sm:hidden" />
                  <LatencyStrip
                    id={entry.id}
                    decorative
                    className="max-w-52 flex-1 xl:col-start-3 xl:row-start-1 xl:max-w-none"
                  />
                  <Latency result={result} className="xl:col-start-4 xl:row-start-1" />
                </span>
              </RateTrigger>
              <RateContent>
                <Panel entry={entry} result={result} />
              </RateContent>
            </RateItem>
          )
        })}
      </RateAccordion>
    </TooltipProvider>
  )
}
