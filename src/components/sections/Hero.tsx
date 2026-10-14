import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'

import { Emblem } from '@/components/brand/Emblem'
import { CapabilityMarquee } from '@/components/sections/CapabilityMarquee'
import { HeroGlow, HeroHorizon, HeroTopWash } from '@/components/sections/showcase/HeroLight'
import { HeroOrbit, HeroTileRow } from '@/components/sections/showcase/HeroOrbit'
import { Button } from '@/components/ui/button'
import { productById, products } from '@/data/products'
import { useHealth } from '@/hooks/useHealth'
import { statusCopy, type HealthStatus } from '@/lib/health'
import { cn } from '@/lib/utils'

const studio = productById.studio

/** Kit hero pill: exactly 52px (16px / 24px line), narrower padding on phones, full width below 360px. */
const heroBtn = 'leading-6 max-sm:px-5 max-[359px]:w-full'

const dotTone: Record<HealthStatus, string> = {
  operational: 'text-green-500',
  degraded: 'text-yellow-500',
  down: 'text-red-400',
  checking: 'text-indigo-300',
}

/** Small live pill under the hero buttons: aggregate health, links to /status. */
function HeroStatusPill() {
  const { aggregate } = useHealth()
  const { status, up, total } = aggregate
  const label =
    status === 'checking'
      ? 'Checking services…'
      : status === 'operational'
        ? `All systems operational · ${total} services`
        : `${statusCopy[status].summary} · ${up} of ${total} up`

  return (
    <Link
      to="/status"
      className={cn(
        'group relative mt-6 inline-flex h-9 max-w-full min-w-[min(100%,19rem)] items-center justify-center gap-2.5 rounded-full border border-st bg-white/60 pr-3.5 pl-4 md:mt-8 [@media(min-height:741px)_and_(max-height:820px)]:md:mt-5 [@media(max-height:740px)]:md:mt-4',
        'text-[13px] leading-none text-tx-secondary backdrop-blur-md md:text-sm',
        'transition-[background-color,color,border-color] duration-200 ease-standard hover:border-st hover:bg-white/90 hover:text-tx',
        // Extend the hit area to 44px without growing the visual pill.
        "before:absolute before:-inset-y-1 before:inset-x-0 before:content-['']",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'size-2 shrink-0 rounded-full bg-current',
          dotTone[status],
          status === 'operational' && 'animate-pulse-dot',
        )}
      />
      <span className="truncate tabular">{label}</span>
      <span className="sr-only">, view live status</span>
      <ChevronRight
        aria-hidden="true"
        strokeWidth={1.5}
        className="size-4 shrink-0 text-tx-tertiary transition-transform duration-200 ease-standard group-hover:translate-x-0.5"
      />
    </Link>
  )
}

/**
 * Product-orbit hero, exactly one screen tall: the six glossy product tiles
 * float in an arc around the headline, and a warm horizon glow rises from
 * below the copy. A flexible horizon band absorbs spare height so the copy
 * stays centred and the marquee is pinned to the bottom of the first screen.
 * Short screens compress spacing (and the orbit) instead of overflowing.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-svh flex-col overflow-x-clip pt-24 md:pt-28 [@media(max-height:740px)]:md:pt-24"
    >
      <HeroTopWash />
      <HeroGlow />

      <div aria-hidden="true" className="flex-1" />

      {/* Copy stage: the orbit is positioned against this box. */}
      <div className="relative z-[2] container-page flex flex-col items-center text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 bg-(image:--gradient-hero-glow) opacity-30 blur-[80px] md:h-[400px] md:w-[640px] md:opacity-35 md:blur-[100px]"
        />

        <HeroTileRow className="mb-6" />

        <p className="inline-flex h-8 items-center gap-2 rounded-full bg-white/70 pr-3.5 pl-2.5 text-[13px] leading-none text-tx-secondary shadow-[0_1px_2px_rgb(30_32_51/0.04)] ring-1 ring-st backdrop-blur-md md:text-sm">
          <Emblem className="size-4 text-orange-700" />
          <span>
            ET AI Labs <span aria-hidden="true">·</span>
            <span className="sr-only">,</span> {products.length} products
          </span>
        </p>

        <h1
          id="hero-title"
          className="mt-5 max-w-4xl h-hero max-[359px]:text-[38px] md:mt-7 [@media(min-height:741px)_and_(max-height:820px)]:md:mt-6 [@media(max-height:740px)]:md:mt-5"
        >
          <span className="block">Every ET AI tool,</span>
          <span className="block">one front door</span>
        </h1>

        <p className="mt-2.5 max-w-2xl text-lead text-pretty md:mt-3.5 [@media(max-height:740px)]:md:mt-2.5">
          Create, call, verify and converse with ET AI.
          <br className="hidden md:block" /> Launch any product, explore its APIs and check live
          status.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-3 sm:gap-4 md:mt-8 md:gap-5 [@media(min-height:741px)_and_(max-height:820px)]:md:mt-6 [@media(max-height:740px)]:md:mt-5">
          <Button variant="hero" size="hero" arrow asChild className={heroBtn}>
            <a href={studio.consoleUrl} target="_blank" rel="noopener noreferrer">
              <span className="sm:hidden">Open Studio</span>
              <span className="hidden sm:inline">Open AI Creative Studio</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </Button>
          <Button variant="heroOutline" size="hero" asChild className={heroBtn}>
            <a href="#products">Explore products</a>
          </Button>
        </div>

        <HeroStatusPill />

        <HeroOrbit />
      </div>

      <HeroHorizon className="min-h-24 flex-[1.6] md:min-h-40 [@media(min-height:741px)_and_(max-height:820px)]:md:min-h-[120px] [@media(max-height:740px)]:md:min-h-[100px]" />

      <CapabilityMarquee />
    </section>
  )
}
