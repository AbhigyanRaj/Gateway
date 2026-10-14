import { cn } from '@/lib/utils'

import { WORDMARK_HEIGHT, WORDMARK_PATH, WORDMARK_WIDTH } from './paths'

/**
 * The ET AI Labs wordmark as live text: Figtree 700, tracking -0.035em.
 * Black on light, white on dark (`text-white`). The only bold text on the
 * site. Size it with a font-size class (header 24px, footer ~35px).
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      translate="no"
      className={cn(
        'inline-block font-sans text-2xl leading-none font-bold tracking-wordmark whitespace-nowrap text-black',
        className,
      )}
    >
      ET AI Labs
    </span>
  )
}

/**
 * The same wordmark as outlined SVG paths (no font dependency). Inherits
 * `currentColor`; size it by width or height, the aspect ratio is intrinsic.
 */
export function WordmarkPaths({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox={`0 0 ${WORDMARK_WIDTH} ${WORDMARK_HEIGHT}`}
      fill="currentColor"
      className={cn('shrink-0', className)}
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <path d={WORDMARK_PATH} />
    </svg>
  )
}
