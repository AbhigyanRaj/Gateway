import { cn } from '@/lib/utils'

import { ORNAMENT_BASELINE, ORNAMENT_DIAMOND, ORNAMENT_LEAVES, ORNAMENT_STEM } from './paths'

/**
 * The crest ornament (208 x 32): a tapered hairline baseline under two
 * mirrored leafy sprigs that curl outward from a small centre diamond.
 * Decorative; inherits `currentColor`. Size it by height (e.g. `h-6 md:h-8`).
 */
export function Ornament({ className }: { className?: string }) {
  const sprig = (
    <>
      <path d={ORNAMENT_STEM} fill="none" />
      <path d={ORNAMENT_LEAVES} fill="currentColor" />
    </>
  )
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 208 32"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('aspect-[208/32] w-auto shrink-0', className)}
    >
      <path d={ORNAMENT_BASELINE} fill="currentColor" stroke="none" />
      <g>{sprig}</g>
      <g transform="matrix(-1 0 0 1 208 0)">{sprig}</g>
      <path d={ORNAMENT_DIAMOND} fill="currentColor" stroke="none" />
    </svg>
  )
}
