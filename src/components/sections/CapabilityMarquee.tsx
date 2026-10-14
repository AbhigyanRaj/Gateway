import { Activity, Braces, type LucideIcon } from 'lucide-react'

import { ProductTile } from '@/components/product/ProductTile'
import type { ProductId } from '@/data/products'

type Capability = { label: string } & ({ product: ProductId } | { glyph: LucideIcon })

const capabilities: readonly Capability[] = [
  { label: 'Image generation', product: 'studio' },
  { label: 'Creative variations', product: 'studio' },
  { label: 'AI voice calls', product: 'voice' },
  { label: 'Telephony and CRM sync', product: 'voice' },
  { label: 'Multilingual speech-to-text', product: 'tcc' },
  { label: 'AI video verdicts', product: 'tcc' },
  { label: 'Knowledge-base chat', product: 'marathon' },
  { label: 'Grounded answers', product: 'marathon' },
  { label: 'REST APIs', glyph: Braces },
  { label: 'Live health checks', glyph: Activity },
]

/** Platform-wide items get a neutral frosted tile in the same footprint as a product tile. */
function GlyphTile({ glyph: Glyph }: { glyph: LucideIcon }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-[22px] shrink-0 place-items-center rounded-[6px] bg-linear-to-b from-white to-indigo-100 text-indigo-600 shadow-[inset_0_0_0_1px_rgb(167_192_241/0.45),0_1px_2px_rgb(33_33_145/0.08)]"
    >
      <Glyph strokeWidth={1.75} className="size-3.5" />
    </span>
  )
}

function CapabilityList({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul
      role={hidden ? undefined : 'list'}
      aria-label={hidden ? undefined : 'What you can do with ET AI'}
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center"
    >
      {capabilities.map((item) => (
        // Spacing is per-item padding (not gap) so the -50% loop lands exactly.
        <li
          key={item.label}
          className="flex shrink-0 items-center gap-2.5 pr-[60px] text-[15px] leading-6 font-medium tracking-[-0.01em] whitespace-nowrap text-tx-secondary md:text-base"
        >
          {'product' in item ? (
            <ProductTile id={item.product} size={22} />
          ) : (
            <GlyphTile glyph={item.glyph} />
          )}
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * Endless row of capabilities at the foot of the hero (stands in for the
 * kit's customer-logo marquee). Edges fade out; hover pauses; reduced motion
 * stops it (global CSS).
 */
export function CapabilityMarquee() {
  return (
    <div className="relative z-10 flex w-full flex-col items-center gap-5 pb-8 md:gap-8 md:pb-10 [@media(min-height:741px)_and_(max-height:820px)]:md:gap-6 [@media(min-height:741px)_and_(max-height:820px)]:md:pb-8 [@media(max-height:740px)]:md:gap-5 [@media(max-height:740px)]:md:pb-8">
      <p className="eyebrow text-tx-secondary">What you can do</p>
      <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
        <div className="flex w-max animate-marquee will-change-transform [animation-duration:60s] hover:[animation-play-state:paused]">
          <CapabilityList />
          <CapabilityList hidden />
        </div>
      </div>
    </div>
  )
}
