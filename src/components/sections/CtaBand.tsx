import { Emblem } from '@/components/brand/Emblem'
import { ExternalLink } from '@/components/primitives/ExternalLink'
import { Section } from '@/components/primitives/Section'
import { Button } from '@/components/ui/button'
import { productById } from '@/data/products'

/**
 * Dusk CTA band (the page's one dark band): double-ring mat, navy to
 * periwinkle gradient, grain, faint rings, white display headline, a solid
 * emblem glyph and an ink pill.
 */
export function CtaBand() {
  const studio = productById.studio
  return (
    <Section aria-labelledby="cta-title">
      <div className="w-full rounded-2xl outline-2 outline-offset-2 outline-st md:rounded-3xl">
        <div className="relative isolate flex min-h-[450px] flex-col items-center justify-between gap-8 overflow-hidden rounded-2xl bg-(image:--gradient-cta-dark) px-4 py-[50px] md:gap-10 md:rounded-3xl md:py-[60px]">
          {/* Grain */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 rotate-180 bg-noise opacity-50 mix-blend-soft-light"
          />
          {/* Rings, clipped at the bottom */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[225px] left-1/2 -z-10 h-[895px] w-[903px] max-w-none -translate-x-1/2 scale-75 rounded-full bg-[repeating-radial-gradient(circle,transparent_0_119px,rgba(255,255,255,0.09)_120px_121px)] shadow-[0_0_0_1px_rgba(255,255,255,0.08)] md:top-[237px] md:scale-100"
          />

          <h2
            id="cta-title"
            className="w-full max-w-[83%] text-center font-display text-[30px] leading-[1.45] font-hero tracking-[-0.01em] text-balance text-white max-[359px]:max-w-none max-[359px]:text-[26px] md:text-heading-section md:leading-[1.5]"
          >
            <span className="md:block">Make something remarkable</span>{' '}
            <span className="md:block">with AI Creative Studio</span>
          </h2>

          <Emblem variant="solid" className="size-14 text-white" />

          {studio.consoleUrl && (
            <Button asChild variant="ink" arrow className="ring-1 ring-white/15">
              <ExternalLink href={studio.consoleUrl}>Open AI Creative Studio</ExternalLink>
            </Button>
          )}
        </div>
      </div>
    </Section>
  )
}
