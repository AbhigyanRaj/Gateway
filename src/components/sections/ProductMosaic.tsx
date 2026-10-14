import { Activity, BookOpen } from 'lucide-react'

import { LinkRow } from '@/components/product/LinkRow'
import { ProductCard } from '@/components/product/ProductCard'
import { StatusDot } from '@/components/product/StatusChip'
import { Section } from '@/components/primitives/Section'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import { products, serverHealth } from '@/data/products'
import { useHealth } from '@/hooks/useHealth'
import { useReveal } from '@/hooks/useReveal'
import { formatLatency } from '@/lib/format'
import {
  services,
  statusCopy,
  type HealthAggregate,
  type HealthResult,
  type ServiceId,
} from '@/lib/health'
import { cn } from '@/lib/utils'

const host = new URL(serverHealth.url).host

/*
 * Grid maths: the featured card takes 2 cells, every other product 1. The
 * developer card spans whatever is left in the last row, so there are no holes.
 */
const cellsBeforeDev = 2 + (products.length - 1)
const lgLeft = cellsBeforeDev % 3
const devLgSpan = lgLeft === 0 ? 3 : 3 - lgLeft
const devMdSpan = cellsBeforeDev % 2 === 0 ? 2 : 1
const lgSpanClass = { 1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3' } as const
const devSpanClass = cn(devMdSpan === 2 && 'md:col-span-2', lgSpanClass[devLgSpan as 1 | 2 | 3])
/** Wide enough for a side-by-side layout (text left, endpoints right). */
const devWide = devLgSpan >= 2

function DeveloperCard({
  results,
  summary,
  wide,
}: {
  results: Record<ServiceId, HealthResult | undefined>
  summary: HealthAggregate
  wide: boolean
}) {
  return (
    <article
      aria-labelledby="card-dev-title"
      className={cn(
        'flex h-full flex-col gap-6 rounded-2xl border border-st-secondary bg-white p-6 transition-[border-color] duration-200 ease-standard hover:border-st xl:p-8',
        wide && 'lg:flex-row lg:gap-8',
      )}
    >
      <div className={cn('flex min-w-0 flex-col', wide && 'lg:w-[44%] lg:shrink-0')}>
        <p className="text-label font-medium tracking-eyebrow text-tx-tertiary uppercase">
          Developers
        </p>
        <h3
          id="card-dev-title"
          className="mt-1 text-heading-card leading-[1.3] font-medium tracking-card text-balance text-tx"
        >
          Every endpoint, one host
        </h3>
        <p className="mt-4 text-body-muted">
          Plain HTTPS and JSON. Base URLs, health checks and docs for each service.
        </p>
        <div className={cn('hidden flex-col pt-6', wide && 'lg:mt-auto lg:flex')}>
          <LinkRow icon={BookOpen} to="/apis">
            Browse all APIs
          </LinkRow>
          <LinkRow icon={Activity} to="/status">
            Service status
          </LinkRow>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-6 overflow-hidden rounded-lg border border-st-secondary bg-(image:--gradient-showcase-panel) p-4 font-mono text-[13px] leading-[1.9] xl:p-5">
        <div>
          <p className="text-tx-tertiary"># {host}</p>
          <ul aria-label="Health endpoints">
            {services.map((svc) => {
              const status = results[svc.id]?.status ?? 'checking'
              return (
                <li key={svc.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate">
                    <span className="text-indigo-800">GET</span>{' '}
                    <span className="text-green-700">{svc.healthPath}</span>
                  </span>
                  <StatusDot status={status} label={`${svc.name}: ${statusCopy[status].label}`} />
                </li>
              )
            })}
          </ul>
        </div>
        <p className="text-tx-tertiary">
          {summary.status === 'checking'
            ? '# checking…'
            : `# ${summary.up}/${summary.total} up${summary.medianLatencyMs === null ? '' : `, median ${formatLatency(summary.medianLatencyMs)}`}`}
        </p>
      </div>

      <div className={cn('flex flex-col', wide && 'lg:hidden')}>
        <LinkRow icon={BookOpen} to="/apis">
          Browse all APIs
        </LinkRow>
        <LinkRow icon={Activity} to="/status">
          Service status
        </LinkRow>
      </div>
    </article>
  )
}

/**
 * Product mosaic: AI Creative Studio as a featured card across two columns,
 * then every other product and a developer card. 8px gaps, no holes.
 */
export function ProductMosaic() {
  const { results, aggregate } = useHealth()
  const gridRef = useReveal<HTMLDivElement>(0.05)

  return (
    <Section id="explore" aria-labelledby="explore-title">
      <SectionHeading
        id="explore-title"
        title={'Everything you need,\nin one place'}
        intro={
          <span className="block text-balance">
            Consoles, docs and API endpoints for every product, with live health on each card.
          </span>
        }
      />
      <div
        ref={gridRef}
        data-reveal-stagger=""
        className="grid w-full grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3"
      >
        {products.map((p, i) => (
          <div
            key={p.id}
            className={cn('min-w-0', i === 0 && 'md:col-span-2')}
            style={{ '--i': i } as React.CSSProperties}
          >
            <ProductCard product={p} health={results[p.id]} featured={i === 0} />
          </div>
        ))}
        <div
          className={cn('min-w-0', devSpanClass)}
          style={{ '--i': products.length } as React.CSSProperties}
        >
          <DeveloperCard results={results} summary={aggregate} wide={devWide} />
        </div>
      </div>
    </Section>
  )
}
