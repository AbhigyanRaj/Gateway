import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'

import { Wordmark } from '@/components/brand/Wordmark'
import { site } from '@/config/site'
import { useHealth } from '@/hooks/useHealth'
import { statusCopy } from '@/lib/health'
import { cn } from '@/lib/utils'

import { GiantWordmark } from './GiantWordmark'
import { HealthDot } from './HealthIndicator'
import { footerColumns, type FooterColumn } from './links'
import { SmartLink } from './SmartLink'

const year = new Date().getFullYear()

/**
 * Site footer: brand column (wordmark, tagline, live status, legal box) and
 * four link columns, then the giant masked wordmark cut by the page edge.
 * Desktop (xl+): one row. Tablet and small laptops: 3-column grid, so labels
 * never squeeze onto two lines. Mobile: square hairline boxes.
 */
export function SiteFooter() {
  const { aggregate } = useHealth()

  return (
    <footer
      id="site-footer"
      className="relative flex flex-col items-center gap-12 overflow-hidden border-t border-st-secondary bg-(image:--gradient-footer) pt-12 md:gap-24 md:pt-20"
    >
      <div className="container-page grid gap-10 md:grid-cols-3 md:gap-x-8 md:gap-y-12 xl:flex xl:gap-24">
        {/* Brand column */}
        <div className="flex flex-col gap-8 md:row-span-2 md:gap-10 xl:w-[182px] xl:shrink-0">
          <div className="flex flex-col gap-2.5">
            <Link to="/" aria-label="ET AI Labs home" className="-m-1 w-fit rounded-md p-1">
              <Wordmark className="text-[34.5px]" />
            </Link>
            <p className="text-label text-balance text-tx-tertiary">{site.tagline}</p>
          </div>

          <Link
            to="/status"
            className="group -my-2 inline-flex min-h-10 w-fit items-center gap-2.5 text-caption text-tx-secondary transition-colors duration-200 hover:text-indigo-800"
          >
            <HealthDot status={aggregate.status} label={false} className="size-2" />
            {statusCopy[aggregate.status].summary}
          </Link>

          <div className="border border-st p-3 text-label leading-[18px] text-tx-tertiary">
            <p className="text-tx-secondary">
              © {year} ET AI Labs
              <br />
              The Economic Times
            </p>
            <p className="mt-3">
              Built on
              <br />
              etaiprod.indiatimes.com
            </p>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-4 md:col-span-2 md:grid-cols-2 md:gap-x-8 md:gap-y-12 xl:flex xl:flex-1 xl:justify-between xl:gap-8">
          {footerColumns.map((col) => (
            <FooterCol key={col.title} column={col} />
          ))}
        </div>
      </div>

      <GiantWordmark />
    </footer>
  )
}

function FooterCol({ column, className }: { column: FooterColumn; className?: string }) {
  const id = `footer-${column.title.toLowerCase()}`
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-6 border border-st-secondary p-6 md:border-0 md:p-0',
        className,
      )}
    >
      <h2 id={id} className="label-mono">
        {column.title}
      </h2>
      <ul aria-labelledby={id} className="flex flex-col gap-2.5">
        {column.links.map((link) => {
          const external = !link.href.startsWith('/')
          return (
            <li key={link.label}>
              <SmartLink
                href={link.href}
                className="group text-body leading-6 text-tx-tertiary transition-colors duration-200 hover:text-indigo-800"
              >
                {external ? <WithArrow label={link.label} /> : link.label}
              </SmartLink>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Keeps the trailing ↗ glued to the last word so it never wraps alone. */
function WithArrow({ label }: { label: string }) {
  const cut = label.lastIndexOf(' ')
  return (
    <>
      {label.slice(0, cut + 1)}
      <span className="whitespace-nowrap">
        {label.slice(cut + 1)}
        <ArrowUpRight
          aria-hidden="true"
          strokeWidth={1.5}
          className="ml-1 inline-block size-3.5 -translate-y-px align-middle opacity-70 transition-[opacity,translate] duration-200 group-hover:translate-x-px group-hover:opacity-100"
        />
      </span>
    </>
  )
}
