import { cn } from '@/lib/utils'

import { EMBLEM_DIAMOND, EMBLEM_PETALS_PATH, EMBLEM_STROKE } from './paths'

export interface EmblemProps {
  className?: string
  /**
   * `outline` (default): eight stroked petals around a solid diamond.
   * `solid`: filled petals, for large glyphs and masks.
   */
  variant?: 'outline' | 'solid'
  /** Accessible name. Omit for decorative use (the default). */
  title?: string
}

/**
 * The ET AI Labs emblem: a radial spark of eight identical petals around a
 * solid centre diamond. Secondary mark, never placed next to the wordmark.
 * Inherits `currentColor`; size it with width/height classes.
 */
export function Emblem({ className, variant = 'outline', title }: EmblemProps) {
  const solid = variant === 'solid'
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('shrink-0', className)}
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <path
        d={EMBLEM_PETALS_PATH}
        fill={solid ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={EMBLEM_STROKE}
        strokeLinejoin="round"
      />
      <path d={EMBLEM_DIAMOND} fill="currentColor" />
    </svg>
  )
}
