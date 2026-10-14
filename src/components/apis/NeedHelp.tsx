import { Activity, ArrowRight, ArrowUpRight, BookOpen, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { accentStyles, productById } from '@/data/products'
import { cn } from '@/lib/utils'

const row =
  'group flex min-h-12 items-center justify-between gap-4 border-b border-st py-3 text-body leading-[1.55] tracking-[-0.14px] text-tx-secondary transition-colors duration-200 ease-standard last:border-b-0 hover:text-tx'

function RowInner({
  icon: Icon,
  hover,
  children,
  external,
}: {
  icon: LucideIcon
  hover: string
  children: ReactNode
  external?: boolean
}) {
  const Arrow = external ? ArrowUpRight : ArrowRight
  return (
    <>
      <span className="inline-flex items-center gap-3">
        <Icon
          aria-hidden="true"
          strokeWidth={1.5}
          className={cn(
            'size-5 text-tx-tertiary transition-colors duration-200 ease-standard',
            hover,
          )}
        />
        {children}
      </span>
      <Arrow
        aria-hidden="true"
        strokeWidth={1.5}
        className="size-[18px] text-st transition-[color,translate] duration-200 ease-standard group-hover:translate-x-0.5 group-hover:text-tx-tertiary"
      />
    </>
  )
}

/** Closing help card: a short note on the left, kit link rows on the right. */
export function NeedHelp({ className }: { className?: string }) {
  const docs = productById.tcc.docsUrl
  return (
    <aside
      aria-labelledby="need-help-title"
      className={cn(
        'flex w-full flex-col gap-6 rounded-2xl border border-st-secondary bg-white p-6 md:flex-row md:items-center md:justify-between md:gap-12 md:p-10',
        className,
      )}
    >
      <div className="flex max-w-md flex-col gap-2">
        <h2
          id="need-help-title"
          className="text-heading-card font-medium tracking-[-0.015em] text-tx"
        >
          Need help?
        </h2>
        <p className="text-body-muted">
          Read the TCC API reference, or check live service health before you start debugging.
        </p>
      </div>
      <nav aria-label="Help" className="flex w-full flex-col md:max-w-[340px]">
        {docs && (
          <a href={docs} target="_blank" rel="noopener noreferrer" className={row}>
            <RowInner
              icon={BookOpen}
              hover={accentStyles[productById.tcc.accent].hoverIcon}
              external
            >
              TCC API docs
              <span className="sr-only"> (opens in a new tab)</span>
            </RowInner>
          </a>
        )}
        <Link to="/status" className={row}>
          <RowInner icon={Activity} hover="group-hover:text-hover-indigo">
            Service status
          </RowInner>
        </Link>
      </nav>
    </aside>
  )
}
