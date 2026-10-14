import { Server } from 'lucide-react'
import { Link } from 'react-router'

import { ProductTile } from '@/components/product/ProductTile'
import { StatusChip } from '@/components/product/StatusChip'
import { Section } from '@/components/primitives/Section'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import { Button } from '@/components/ui/button'
import type { ProductId } from '@/data/products'
import { useHealth } from '@/hooks/useHealth'
import { useNow } from '@/hooks/useNow'
import { formatLatency, timeAgo } from '@/lib/format'
import { services, statusCopy, type ServiceId } from '@/lib/health'
import { cn } from '@/lib/utils'

/** Pulsing placeholder that keeps the exact box of the value it stands in for. */
function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block animate-pulse rounded-md bg-sf-tertiary align-middle', className)}
    />
  )
}

function ServiceIcon({ id }: { id: ServiceId }) {
  if (id === 'server') {
    return (
      <span
        aria-hidden="true"
        className="grid size-7 shrink-0 place-items-center rounded-[8px] bg-sf-tertiary text-tx-tertiary"
      >
        <Server strokeWidth={1.5} className="size-4" />
      </span>
    )
  }
  return <ProductTile id={id as ProductId} size={28} />
}

/** "Checked 12s ago": isolated so only this text re-renders every second. */
function CheckedAgo({ at }: { at: number | null }) {
  const now = useNow(1000)
  if (!at) return <Skeleton className="h-5 w-20" />
  return <>{timeAgo(at, now)}</>
}

/**
 * Live status strip: overall state on the left, one stat row per service on
 * the right. Values hold their size while the first checks are in flight.
 */
export function StatusStrip() {
  const { results, aggregate } = useHealth()
  const checking = aggregate.status === 'checking'

  return (
    <Section id="status" aria-labelledby="status-title">
      <SectionHeading
        id="status-title"
        title={'Every service,\nchecked live'}
        intro={
          <span className="block text-balance">
            Health checks run every 30 seconds from your browser.
          </span>
        }
      />

      <div className="grid w-full gap-10 rounded-2xl border border-st-secondary bg-white p-6 sm:p-8 md:p-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:gap-16">
        {/* Overall */}
        <div className="flex flex-col justify-between gap-8">
          <div>
            <div aria-live="polite">
              <StatusChip
                status={aggregate.status}
                label={statusCopy[aggregate.status].summary}
                pulse
              />
            </div>
            <p className="mt-6 font-display text-[32px] leading-[1.1] font-hero tracking-[-0.02em] text-tx sm:text-[40px] md:text-metric md:leading-[1.1] lg:text-[40px] xl:text-metric">
              {checking ? (
                <>
                  <Skeleton className="h-[0.8em] w-[1.6em] -translate-y-[0.06em] rounded-lg" />
                  <span className="sr-only">Checking services</span>
                </>
              ) : (
                <span className="tabular">
                  {aggregate.up}/{aggregate.total}
                </span>
              )}{' '}
              services up
            </p>

            <dl className="mt-6 grid max-w-sm grid-cols-2 gap-6 border-t border-st-secondary pt-6">
              <div>
                <dt className="text-caption text-tx-tertiary">Median latency</dt>
                <dd className="mt-1 text-heading-card leading-[1.3] font-medium tracking-[-0.5px] text-tx tabular">
                  {aggregate.medianLatencyMs === null ? (
                    <Skeleton className="h-5 w-16" />
                  ) : (
                    formatLatency(aggregate.medianLatencyMs)
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-caption text-tx-tertiary">Last checked</dt>
                <dd className="mt-1 text-heading-card leading-[1.3] font-medium tracking-[-0.5px] text-tx tabular">
                  <CheckedAgo at={aggregate.lastCheckedAt} />
                </dd>
              </div>
            </dl>
          </div>

          <Button asChild variant="soft" arrow className="self-start">
            <Link to="/status">View full status</Link>
          </Button>
        </div>

        {/* Per service */}
        <ul aria-label="Services" className="flex flex-col">
          {services.map((s) => {
            const r = results[s.id]
            const status = r?.status ?? 'checking'
            return (
              <li
                key={s.id}
                className="flex min-h-[60px] items-center gap-3 border-b border-st py-3 last:border-b-0"
              >
                <ServiceIcon id={s.id} />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <span className="min-w-0 text-body leading-[1.55] text-tx-secondary">
                    {s.name}
                  </span>
                  <span className="flex shrink-0 items-center gap-3 sm:gap-4">
                    <StatusChip status={status} size="sm" />
                    <span className="text-caption whitespace-nowrap text-tx-tertiary tabular sm:min-w-16 sm:text-right sm:text-body sm:font-medium sm:text-tx">
                      {r ? (
                        r.latencyMs === null ? (
                          <span className="text-caption font-regular text-tx-tertiary">
                            {r.note ?? 'n/a'}
                          </span>
                        ) : (
                          formatLatency(r.latencyMs)
                        )
                      ) : (
                        <Skeleton className="h-5 w-14" />
                      )}
                    </span>
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </Section>
  )
}
