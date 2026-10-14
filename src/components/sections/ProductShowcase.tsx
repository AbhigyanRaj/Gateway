import { useState } from 'react'

import { Section } from '@/components/primitives/Section'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import { products, type ProductId } from '@/data/products'
import { cn } from '@/lib/utils'

import { ShowcasePanel } from './showcase/ShowcasePanel'
import { panelId, tabId } from './showcase/ids'
import { ShowcaseSelect, ShowcaseTabList } from './showcase/ShowcaseTabs'

/**
 * Glass-frame product showcase, pulled up into the hero. One tab per product
 * (AI Creative Studio first and active by default); below xl the tab bar is a
 * dropdown. All panels share one grid cell, so the frame keeps the height of
 * the tallest panel and the page never jumps when switching.
 */
const countWords = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
const count = countWords[products.length]
const showcaseTitle = count ? `${count} products,\none platform` : 'Every product,\none platform'

export function ProductShowcase() {
  const [active, setActive] = useState<ProductId>(products[0].id)

  return (
    <Section
      id="products"
      reveal="scale"
      contained={false}
      aria-labelledby="products-title"
      className="w-full scroll-mt-6 overflow-x-clip"
    >
      {/* Periwinkle wings behind the frame (md+, clipped to the viewport). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[10vw] bottom-[28%] -left-[10vw] hidden h-2/5 scale-y-[1.2] bg-(image:--gradient-band-indigo) blur-[80px] md:block"
      />

      <div className="relative container-page flex flex-col items-center gap-8 md:gap-14">
        <SectionHeading
          id="products-title"
          title={showcaseTitle}
          intro={
            <span className="block text-balance">
              AI Creative Studio leads the way. Every tool is a click away, with its API and live
              status alongside.
            </span>
          }
        />

        {/* Glass frame */}
        <div className="relative w-full rounded-2xl border border-white/20 bg-linear-to-b from-black/15 to-black/5 p-1.5 outline-1 outline-white/10 backdrop-blur-xl md:rounded-3xl">
          <ShowcaseTabList active={active} onChange={setActive} />
          <ShowcaseSelect active={active} onChange={setActive} />

          <div className="relative flex min-h-[460px] flex-col justify-center overflow-hidden rounded-t-sm rounded-b-xl bg-(image:--gradient-showcase-panel) px-4 pt-10 pb-6 md:min-h-[620px] md:rounded-b-[20px] md:px-10 md:pt-14 md:pb-14">
            <div className="grid">
              {products.map((p) => {
                const selected = p.id === active
                return (
                  <div
                    key={p.id}
                    role="tabpanel"
                    id={panelId(p.id)}
                    aria-labelledby={tabId(p.id)}
                    inert={!selected}
                    className={cn(
                      '[grid-area:1/1]',
                      selected
                        ? 'visible animate-fade-in'
                        : 'invisible opacity-0 transition-[opacity,visibility] duration-150 ease-out',
                    )}
                  >
                    <ShowcasePanel product={p} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
