import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { NavigationMenu } from 'radix-ui'
import { useRef } from 'react'
import { Link, useLocation } from 'react-router'

import { productArt } from '@/assets/art'
import { products } from '@/data/products'
import { useHealth } from '@/hooks/useHealth'
import { statusCopy, type HealthStatus } from '@/lib/health'
import { cn } from '@/lib/utils'

import { HealthDot } from './HealthIndicator'
import { studioUrl } from './links'
import { ProductMenuItem } from './ProductMenuItem'
import { SmartLink } from './SmartLink'

const navItem =
  'relative flex min-h-10 items-center rounded-full px-4 text-nav text-tx transition-colors duration-200 ease-standard hover:text-tx-secondary'

let artPreloaded = false
/** Warm the featured image on first hover so the panel paints complete. */
function preloadArt() {
  if (artPreloaded) return
  artPreloaded = true
  const img = new Image()
  img.decoding = 'async'
  img.src = productArt.studio
}

/**
 * Desktop navigation (lg+): Products mega menu, APIs, Status.
 * Radix NavigationMenu gives hover intent (100ms), click/Enter toggling,
 * Escape and outside-click dismissal and keyboard focus handoff.
 */
export function DesktopNav({
  value,
  onValueChange,
}: {
  value: string
  onValueChange: (value: string) => void
}) {
  const { pathname } = useLocation()
  const { aggregate } = useHealth()

  // Radix toggles on click, so a click right after a hover-open would close
  // the panel the pointer just opened. Track how it opened and keep it open.
  const hoverOpened = useRef(false)
  const inClick = useRef(false)

  const handleValueChange = (next: string) => {
    hoverOpened.current = next !== '' && !inClick.current
    onValueChange(next)
  }

  return (
    <NavigationMenu.Root
      value={value}
      onValueChange={handleValueChange}
      delayDuration={100}
      skipDelayDuration={300}
      aria-label="Main"
      className="hidden lg:block"
    >
      <NavigationMenu.List className="flex items-center">
        <NavigationMenu.Item value="products">
          <NavigationMenu.Trigger
            onPointerEnter={preloadArt}
            onFocus={preloadArt}
            onClick={(e) => {
              inClick.current = true
              queueMicrotask(() => (inClick.current = false))
              if (value === 'products' && hoverOpened.current) {
                // First click after a hover-open: keep it open (Radix skips its toggle).
                e.preventDefault()
                hoverOpened.current = false
              }
            }}
            // The pseudo-element bridges the gap between trigger and panel.
            className={cn(
              navItem,
              "after:absolute after:inset-x-0 after:top-full after:h-4 after:content-['']",
            )}
          >
            Products
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="fixed inset-x-0 top-[68px] animate-mega-reveal border-b border-st-secondary bg-white">
            <MegaPanel status={aggregate.status} />
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Link asChild active={pathname === '/apis'}>
            <Link to="/apis" className={navItem}>
              APIs
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Link asChild active={pathname === '/status'}>
            <Link to="/status" className={cn(navItem, 'gap-2')}>
              Status
              <HealthDot status={aggregate.status} />
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  )
}

function MegaPanel({ status }: { status: HealthStatus }) {
  return (
    <div className="container-page pt-12 pb-14">
      <div className="mx-auto grid max-w-[1080px] grid-cols-3 gap-10">
        <div className="col-span-2 flex flex-col">
          <p
            id="mega-products-label"
            className="mb-6 px-1 text-[11px] leading-4 font-medium tracking-[0.04em] text-tx-tertiary uppercase"
          >
            Products
          </p>
          <ul aria-labelledby="mega-products-label" className="mb-8 grid grid-cols-2 gap-1.5">
            {products.map((p) => (
              <li key={p.id}>
                <NavigationMenu.Link asChild>
                  <ProductMenuItem product={p} />
                </NavigationMenu.Link>
              </li>
            ))}
          </ul>
          <div className="mx-1 mt-auto flex items-center justify-between gap-4 border-t border-st-secondary pt-3">
            <NavigationMenu.Link asChild>
              <Link
                to="/apis"
                className="group inline-flex min-h-10 items-center gap-1.5 text-caption font-medium text-indigo-800 transition-colors duration-200 hover:text-indigo-900"
              >
                View all APIs
                <ArrowRight
                  aria-hidden="true"
                  strokeWidth={1.75}
                  className="size-4 transition-transform duration-200 ease-standard group-hover:translate-x-0.5"
                />
              </Link>
            </NavigationMenu.Link>
            <NavigationMenu.Link asChild>
              <Link
                to="/status"
                className="inline-flex min-h-10 items-center gap-2 text-caption text-tx-tertiary transition-colors duration-200 hover:text-tx"
              >
                <HealthDot status={status} label={false} />
                {statusCopy[status].summary}
              </Link>
            </NavigationMenu.Link>
          </div>
        </div>

        <NavigationMenu.Link asChild>
          <SmartLink
            href={studioUrl}
            className="group flex flex-col self-start rounded-xl border border-sf-tertiary p-1.5 transition-colors duration-200 hover:border-st"
          >
            <span className="block overflow-hidden rounded-lg bg-sf-secondary">
              <img
                src={productArt.studio}
                width={1600}
                height={1000}
                alt=""
                decoding="async"
                className="aspect-video w-full object-cover transition-transform duration-300 ease-standard group-hover:scale-105"
              />
            </span>
            <span className="mt-2.5 mb-1 flex items-center justify-between gap-3 px-1.5 text-caption text-tx">
              Open AI Creative Studio
              <ArrowUpRight
                aria-hidden="true"
                strokeWidth={1.5}
                className="size-4 text-tx-tertiary transition-[color,translate] duration-200 ease-standard group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-tx"
              />
            </span>
          </SmartLink>
        </NavigationMenu.Link>
      </div>
    </div>
  )
}
