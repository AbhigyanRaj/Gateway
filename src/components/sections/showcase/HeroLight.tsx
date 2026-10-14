import { cn } from '@/lib/utils'

/** Faint periwinkle wash at the top of the hero: the header reads clean, not flat. */
export function HeroTopWash() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,rgb(165_187_252/0.12),transparent_70%)]"
    />
  )
}

/*
 * Glow geometry: a 700px-tall rect pinned to the hero's bottom edge. The
 * horizon line (the sun's brightest point) is at y = 520 inside it, i.e.
 * 180px above the hero bottom: between the status pill and the marquee.
 */
const glow = [
  // The sun.
  'radial-gradient(ellipse 620px 250px at 50% 520px, rgb(249 115 12 / 0.92), rgb(251 140 46 / 0.68) 30%, rgb(255 176 83 / 0.4) 58%, rgb(255 176 83 / 0) 100%)',
  // Warm haze around it.
  'radial-gradient(ellipse 1150px 360px at 50% 520px, rgb(255 205 160 / 0.32), rgb(255 205 160 / 0) 72%)',
  // Periwinkle wings along the horizon.
  'radial-gradient(ellipse 1500px 440px at 50% 540px, rgb(165 187 252 / 0.5), rgb(165 187 252 / 0.2) 55%, rgb(165 187 252 / 0) 100%)',
].join(', ')

/** Full above the horizon, calm behind the marquee, fully gone at the hero's bottom edge. */
const glowMask =
  'linear-gradient(to bottom, transparent 0, #000 250px, #000 488px, rgb(0 0 0 / 0.62) 528px, rgb(0 0 0 / 0.3) 572px, rgb(0 0 0 / 0.12) 630px, transparent 700px)'

const grainMask = 'radial-gradient(ellipse 760px 260px at 50% 520px, #000 20%, transparent 100%)'

/**
 * Warm horizon light rising from below the copy (the inverse of a top sunrise
 * band), with a soft grain on the glow only. Ends cleanly at the hero bottom.
 */
export function HeroGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[700px] w-[2400px] origin-[50%_520px] -translate-x-1/2 scale-x-[.55] scale-y-[.85] md:scale-x-[.85] md:scale-y-100 lg:scale-x-100 [@media(max-height:740px)]:md:scale-y-[.72] [@media(min-height:741px)_and_(max-height:820px)]:md:scale-y-[.85]"
    >
      <div
        className="absolute inset-0"
        style={{ backgroundImage: glow, maskImage: glowMask, WebkitMaskImage: glowMask }}
      />
      <div
        className="absolute inset-0 bg-noise opacity-25 mix-blend-soft-light"
        style={{ maskImage: grainMask, WebkitMaskImage: grainMask }}
      />
    </div>
  )
}

/** Ring caps peeking over the horizon (radius px); their centre sits 300px below it. */
const rings = [330, 385, 450]

/**
 * The flexible band between the copy and the marquee. It absorbs spare
 * height (so the marquee is pinned to the bottom of the first screen) and
 * holds the arc lines: clipped to the band and cut at the horizon, so no line
 * ever crosses text.
 */
export function HeroHorizon({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('pointer-events-none relative w-full', className)}>
      <div className="absolute inset-x-0 top-0 bottom-[88px] -z-10 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_45%,#000_75%,transparent)] md:bottom-[68px]">
        <div className="absolute top-[calc(100%+180px)] left-1/2 scale-[.6] md:top-[calc(100%+300px)] md:scale-100">
          {rings.map((r) => (
            <span
              key={r}
              className="absolute rounded-full border border-white/20"
              style={{ width: r * 2, height: r * 2, left: -r, top: -r }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
