import { Activity, Globe, Info, LockKeyhole } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router'

import { CopyActions, CopyValue } from '@/components/product/CopyField'
import { Ago } from '@/components/status/Ago'
import { StatusChip, StatusDot } from '@/components/product/StatusChip'
import { formatLatency } from '@/lib/format'
import type { HealthResult, ServiceId } from '@/lib/health'
import { cn } from '@/lib/utils'

import type { ApiEntry } from './entries'
import {
  openTone,
  RateAccordion,
  RateChevron,
  RateContent,
  RateHead,
  RateItem,
  RateTrigger,
  rowReveal,
} from './RateAccordion'
import { ServiceTile } from './ServiceTile'

const grid =
  'grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 md:grid-cols-[9.5rem_minmax(0,1fr)_5.5rem] md:items-center md:gap-x-6'

/** One FIELD / VALUE / ACTION row. Mobile: label + actions on top, value below. */
function Row({
  index,
  label,
  value,
  actions,
}: {
  index: number
  label: string
  value: ReactNode
  actions?: ReactNode
}) {
  return (
    <div
      className={cn(grid, rowReveal, 'min-h-12 px-5 py-2.5 sm:px-6 md:px-8 md:py-2')}
      style={{ '--i': index } as CSSProperties}
    >
      <dt className="col-start-1 row-start-1 self-center text-caption font-medium text-tx-secondary md:text-body md:text-tx">
        {label}
      </dt>
      <dd className="col-span-2 col-start-1 row-start-2 min-w-0 md:col-span-1 md:col-start-2 md:row-start-1">
        {value}
      </dd>
      <dd className="col-start-2 row-start-1 -my-1 flex justify-end self-center md:col-start-3 md:my-0">
        {actions}
      </dd>
    </div>
  )
}

function Note({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-start gap-2 text-caption text-pretty text-tx-secondary md:items-center md:text-body">
      <Info
        aria-hidden="true"
        strokeWidth={1.5}
        className="mt-0.5 size-4 shrink-0 text-tx-tertiary md:mt-0"
      />
      {children}
    </span>
  )
}

function UrlRow({ index, label, url }: { index: number; label: string; url: string }) {
  return (
    <Row
      index={index}
      label={label}
      value={<CopyValue value={url} />}
      actions={<CopyActions label={label} value={url} />}
    />
  )
}

function LastCheck({ result }: { result: HealthResult | undefined }) {
  if (!result) {
    return <span className="text-caption text-tx-tertiary md:text-body">Checking now…</span>
  }
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <StatusChip status={result.status} size="sm" />
      <span className="text-caption text-tx-secondary tabular md:text-body">
        {result.httpStatus === null ? (result.note ?? 'No response') : `HTTP ${result.httpStatus}`}
        {' · '}
        {formatLatency(result.latencyMs)}
        {' · '}
        <Ago ts={result.checkedAt} />
      </span>
    </span>
  )
}

function Panel({ entry, result }: { entry: ApiEntry; result: HealthResult | undefined }) {
  let i = 0
  return (
    <>
      <RateHead className="grid-cols-[9.5rem_minmax(0,1fr)_5.5rem]">
        <span>Field</span>
        <span>Value</span>
        <span className="text-right">Action</span>
      </RateHead>
      <dl className="divide-y divide-st-secondary">
        {entry.publicApi ? (
          <UrlRow index={i++} label="Base URL" url={entry.baseUrl} />
        ) : (
          <Row index={i++} label="API" value={<Note>{entry.apiNote ?? 'No public API'}</Note>} />
        )}
        <UrlRow index={i++} label="Health URL" url={entry.healthUrl} />
        <Row
          index={i++}
          label="Auth"
          value={
            <span className="flex items-start gap-2 text-caption text-tx-secondary md:items-center md:text-body">
              {entry.signInRequired || entry.authRequired ? (
                <LockKeyhole
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="mt-0.5 size-4 shrink-0 text-tx-tertiary md:mt-0"
                />
              ) : (
                <Globe
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="mt-0.5 size-4 shrink-0 text-tx-tertiary md:mt-0"
                />
              )}
              {entry.authRequired
                ? 'Sign-in required · returns 401 without a session'
                : entry.signInRequired
                  ? 'Sign-in required'
                  : 'Public'}
            </span>
          }
        />
        {entry.apiNote && entry.publicApi && (
          <Row index={i++} label="Note" value={<Note>{entry.apiNote}</Note>} />
        )}
        {entry.consoleUrl && <UrlRow index={i++} label="Console" url={entry.consoleUrl} />}
        {entry.docsUrl && <UrlRow index={i++} label="Docs" url={entry.docsUrl} />}
        <Row
          index={i++}
          label="Last check"
          value={<LastCheck result={result} />}
          actions={
            <Link
              to={`/status#${entry.id}`}
              aria-label={`${entry.name} on the status page`}
              className="relative inline-flex size-8 items-center justify-center rounded-full text-tx-tertiary transition-colors duration-200 ease-standard after:absolute after:-inset-1 hover:bg-sf-tertiary hover:text-tx"
            >
              <Activity aria-hidden="true" strokeWidth={1.5} className="size-4" />
            </Link>
          }
        />
      </dl>
    </>
  )
}

interface ApiDetailsTableProps {
  entries: readonly ApiEntry[]
  results: Record<ServiceId, HealthResult | undefined>
  open: readonly string[]
  onOpenChange: (open: string[]) => void
  className?: string
}

/** Accordion rate table: one row per API, expanding to copyable endpoints. */
export function ApiDetailsTable({
  entries,
  results,
  open,
  onOpenChange,
  className,
}: ApiDetailsTableProps) {
  return (
    <RateAccordion value={open} onValueChange={onOpenChange} className={className}>
      {entries.map((entry) => {
        const result = results[entry.id]
        const status = result?.status ?? 'checking'
        return (
          <RateItem key={entry.id} id={entry.id}>
            <RateTrigger>
              <ServiceTile id={entry.id} size={40} className="-my-1" />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-lg leading-snug font-medium tracking-[-0.02em] md:text-xl',
                      openTone,
                    )}
                  >
                    {entry.name}
                  </span>
                  <StatusDot status={status} className="sm:hidden" />
                </span>
                <span className="text-caption text-tx-secondary">{entry.tagline}</span>
              </span>
              <StatusChip status={status} size="sm" className="hidden sm:inline-flex" />
              <RateChevron />
            </RateTrigger>
            <RateContent>
              <Panel entry={entry} result={result} />
            </RateContent>
          </RateItem>
        )
      })}
    </RateAccordion>
  )
}
