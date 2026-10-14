import { ApiSection } from '@/components/sections/ApiSection'
import { CtaBand } from '@/components/sections/CtaBand'
import { Hero } from '@/components/sections/Hero'
import { ProductMosaic } from '@/components/sections/ProductMosaic'
import { ProductShowcase } from '@/components/sections/ProductShowcase'
import { StatusStrip } from '@/components/sections/StatusStrip'
import { site } from '@/config/site'

/**
 * Home composition. The showcase pulls itself up into the hero with a
 * negative margin; section gaps are 96px (mobile) / 176px (md+).
 */
export default function HomePage() {
  return (
    <>
      <title>{`${site.name} — Every ET AI product, one front door`}</title>
      <meta name="description" content={site.description} />
      <div className="flex flex-col gap-24 md:gap-44">
        {/* Hero renders the capability marquee at its foot (first viewport). */}
        <Hero />
        <ProductShowcase />
        <ProductMosaic />
        <ApiSection />
        <StatusStrip />
        <CtaBand />
      </div>
    </>
  )
}
