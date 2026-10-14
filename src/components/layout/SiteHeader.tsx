import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'

import { Wordmark } from '@/components/brand/Wordmark'
import { Button } from '@/components/ui/button'
import { useScrolled } from '@/hooks/useScrolled'
import { cn } from '@/lib/utils'

import { studioUrl } from './links'
import { DesktopNav } from './MegaMenu'
import { BurgerButton, MobileDrawer } from './MobileDrawer'

const DRAWER_ID = 'mobile-menu'
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Elements behind the header that become inert while the drawer is open. */
function pageRegions(): HTMLElement[] {
  return [document.getElementById('main'), document.getElementById('site-footer')].filter(
    (el): el is HTMLElement => el !== null,
  )
}

/**
 * Fixed site header. Transparent over the hero; a white layer and hairline
 * fade in once the page scrolls (or whenever a menu is open).
 * lg+: wordmark · centred nav with the Products mega menu · two pills.
 * Below lg: wordmark · Studio pill · burger that opens a top-sheet drawer.
 */
export function SiteHeader() {
  const scrolled = useScrolled(10)
  const [mega, setMega] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const burgerRef = useRef<HTMLButtonElement>(null)

  // Close everything on route change (adjusting state during render).
  const location = useLocation()
  const routeKey = location.pathname + location.search + location.hash
  const [lastRoute, setLastRoute] = useState(routeKey)
  if (routeKey !== lastRoute) {
    setLastRoute(routeKey)
    setDrawerOpen(false)
    setMega('')
  }

  const closeDrawer = useCallback((restoreFocus: boolean) => {
    setDrawerOpen(false)
    if (restoreFocus) burgerRef.current?.focus()
  }, [])

  // Crossing the lg breakpoint closes whichever menu no longer applies.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 64rem)')
    const onChange = () => (mq.matches ? setDrawerOpen(false) : setMega(''))
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Drawer: lock scroll, make the page inert, trap focus, close on Escape.
  useEffect(() => {
    if (!drawerOpen) return
    const root = document.documentElement
    const scrollbar = window.innerWidth - root.clientWidth
    const prev = { overflow: root.style.overflow, paddingRight: document.body.style.paddingRight }
    root.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
    const regions = pageRegions()
    regions.forEach((el) => (el.inert = true))

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeDrawer(true)
        return
      }
      if (e.key !== 'Tab' || !headerRef.current) return
      const items = Array.from(headerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0 && !el.closest('[inert]'),
      )
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !headerRef.current.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !headerRef.current.contains(active))) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      root.style.overflow = prev.overflow
      document.body.style.paddingRight = prev.paddingRight
      regions.forEach((el) => (el.inert = false))
    }
  }, [drawerOpen, closeDrawer])

  const megaOpen = mega !== ''
  const solid = scrolled || megaOpen || drawerOpen

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-[10000]">
      {/* Dim + blur the page behind an open menu. */}
      {(megaOpen || drawerOpen) && (
        <div
          aria-hidden="true"
          onClick={() => closeDrawer(false)}
          className="fixed inset-0 -z-20 animate-backdrop-fade bg-black/18 backdrop-blur-[6px]"
        />
      )}

      {/* White layer + hairline (full-bleed on lg, inset to the container below). */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 -z-10 bg-white transition-opacity duration-300 ease-out',
          solid ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div className="absolute inset-x-0 bottom-0 mx-auto h-px w-[88%] bg-st-secondary md:w-[83.333%] lg:w-full" />
      </div>

      {drawerOpen && <MobileDrawer id={DRAWER_ID} onNavigate={() => closeDrawer(false)} />}

      <div className="container-page flex items-center justify-between gap-4 py-3 lg:py-3.5">
        <div className="flex flex-1 basis-0 items-center">
          <Link to="/" aria-label="ET AI Labs home" className="-m-1 rounded-md p-1">
            <Wordmark />
          </Link>
        </div>

        <DesktopNav value={mega} onValueChange={setMega} />

        <div className="flex flex-1 basis-0 items-center justify-end gap-2">
          <Button asChild variant="ink" size="sm" className="hidden lg:inline-flex">
            <a href={studioUrl} target="_blank" rel="noopener noreferrer">
              Open AI Studio
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </Button>
          <Button asChild variant="soft" size="sm" className="hidden lg:inline-flex">
            <Link to="/apis">API docs</Link>
          </Button>

          <Button asChild variant="soft" size="sm" className="lg:hidden">
            <a href={studioUrl} target="_blank" rel="noopener noreferrer">
              Studio
              <span className="sr-only"> (opens AI Creative Studio in a new tab)</span>
            </a>
          </Button>
          <BurgerButton
            ref={burgerRef}
            open={drawerOpen}
            controls={DRAWER_ID}
            onClick={() => setDrawerOpen((o) => !o)}
          />
        </div>
      </div>
    </header>
  )
}
