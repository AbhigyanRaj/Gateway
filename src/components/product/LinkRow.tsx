import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router'

import { accentStyles, type Accent } from '@/data/products'
import { cn } from '@/lib/utils'

interface LinkRowProps {
  icon: LucideIcon
  children: React.ReactNode
  /** Internal route (react-router). Shows a → arrow. */
  to?: string
  /** External URL (new tab). Shows a ↗ arrow. */
  href?: string
  /** Icon hover tint (the product accent). Defaults to the neutral indigo link tint. */
  accent?: Accent
  /** Replaces the arrow on the right (e.g. a live status chip). */
  trailing?: React.ReactNode
  className?: string
}

const rowClass = cn(
  'group flex min-h-[50px] items-center justify-between gap-3 border-b border-st py-3 last:border-b-0',
  'text-body leading-[1.55] tracking-[-0.14px] text-tx-secondary',
  'transition-colors duration-200 ease-standard hover:text-tx focus-visible:rounded-md focus-visible:text-tx',
)

function Arrow({ external }: { external: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        'size-[18px] shrink-0 text-st transition-[color,translate] duration-200 ease-standard',
        'group-hover:text-tx-tertiary group-focus-visible:text-tx-tertiary',
        external
          ? 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
          : 'group-hover:translate-x-0.5',
      )}
    >
      {external ? <path d="M7 17 17 7M8 7h9v9" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
    </svg>
  )
}

/**
 * Kit link row: 20px icon + label, hairline separators, faint arrow on the
 * right. On hover the icon takes the accent tint, the label darkens and the
 * arrow darkens and nudges. Use inside a plain flex column.
 */
export function LinkRow({
  icon: Icon,
  children,
  to,
  href,
  accent,
  trailing,
  className,
}: LinkRowProps) {
  const external = !to && !!href
  const inner = (
    <>
      <span className="flex min-w-0 items-center gap-3">
        <Icon
          aria-hidden="true"
          strokeWidth={1.5}
          className={cn(
            'size-5 shrink-0 text-tx-tertiary transition-colors duration-200 ease-standard',
            accent ? accentStyles[accent].hoverIcon : 'group-hover:text-hover-indigo',
          )}
        />
        <span className="min-w-0">{children}</span>
      </span>
      {trailing ?? <Arrow external={external} />}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={cn(rowClass, className)}>
        {inner}
      </Link>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn(rowClass, className)}>
      {inner}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}
