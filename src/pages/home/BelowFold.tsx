import { useLayoutEffect } from 'react'

import { ApiSection } from '@/components/sections/ApiSection'
import { CtaBand } from '@/components/sections/CtaBand'
import { ProductMosaic } from '@/components/sections/ProductMosaic'
import { ProductShowcase } from '@/components/sections/ProductShowcase'
import { StatusStrip } from '@/components/sections/StatusStrip'

let mountedBefore = false

/**
 * Everything on the home page below the first screen. It ships as its own
 * chunk so the hero paints without waiting for it.
 */
export default function BelowFold() {
  // The router's ScrollRestoration ran before this chunk arrived, so a deep
  // link such as /#products found no target. Scroll to it once, on the first
  // mount only (later mounts render synchronously and the router handles them).
  useLayoutEffect(() => {
    if (mountedBefore) return
    mountedBefore = true
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [])

  return (
    <>
      <ProductShowcase />
      <ProductMosaic />
      <ApiSection />
      <StatusStrip />
      <CtaBand />
    </>
  )
}
