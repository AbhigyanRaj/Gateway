import { Suspense } from 'react'

import { Hero } from '@/components/sections/Hero'
import { site } from '@/config/site'

import { lazyPage } from './lazyPage'
import { productNames } from './meta'
import { PageMeta } from './PageMeta'

// Everything below the first screen ships as its own chunk, so the hero
// doesn't wait for it.
const BelowFold = lazyPage(() => import('./home/BelowFold'))

const description = `Launch ${productNames}, explore their APIs and check live service status.`

/**
 * Home composition. The hero fills the first screen and is in the main
 * bundle; the showcase pulls itself up into it with a negative margin.
 * Section gaps are 96px (mobile) / 176px (md+).
 */
export default function HomePage() {
  return (
    <>
      <PageMeta
        title={`${site.name} · Every ET AI product, one front door`}
        description={description}
        path="/"
      />
      <div className="flex flex-col gap-24 md:gap-44">
        {/* Hero renders the capability marquee at its foot (first viewport). */}
        <Hero />
        <Suspense fallback={<div aria-hidden="true" className="min-h-svh" />}>
          <BelowFold />
        </Suspense>
      </div>
    </>
  )
}
