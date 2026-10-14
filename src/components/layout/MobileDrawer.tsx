import { ArrowRight, ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { products } from '@/data/products'
import { useHealth } from '@/hooks/useHealth'
import { cn } from '@/lib/utils'

import { HealthDot } from './HealthIndicator'
import { studioUrl } from './links'
import { ProductMenuItem } from './ProductMenuItem'

const row =
  'flex w-full items-center justify-between gap-4 py-4 text-left text-[15px] leading-5 tracking-[0.08em] text-tx uppercase transition-colors duration-200 hover:text-tx-secondary'

/**
 * The burger: three 18 x 1.5px bars that fold into an ×.
 */
export function BurgerButton({
  open,
  controls,
  onClick,
  ref,
}: {
  open: boolean
  controls: string
  onClick: () => void
  ref?: React.Ref<HTMLButtonElement>
}) {
  const bar =
    'absolute left-[11px] h-[1.5px] w-[18px] rounded-full bg-tx transition-[transform,opacity] duration-300 ease-standard'
  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      aria-label={open ? 'Close menu' : 'Open menu'}
      onClick={onClick}
      className="relative size-10 shrink-0 rounded-full lg:hidden"
    >
      <span
        aria-hidden="true"
        className={cn(bar, 'top-[14px]', open && 'translate-y-[5.25px] rotate-45')}
      />
      <span
        aria-hidden="true"
        className={cn(bar, 'top-[19.25px]', open && 'scale-x-0 opacity-0')}
      />
      <span
        aria-hidden="true"
        className={cn(bar, 'top-[24.5px]', open && '-translate-y-[5.25px] -rotate-45')}
      />
    </button>
  )
}

/**
 * Mobile/tablet drawer (below lg): a white top sheet that sits under the
 * header row. Rendered inside the header so the row (and the burger) stay
 * live; SiteHeader handles focus trap, Escape, scroll lock and dismissal.
 */
export function MobileDrawer({ id, onNavigate }: { id: string; onNavigate: () => void }) {
  const { aggregate } = useHealth()
  const [productsOpen, setProductsOpen] = useState(false)
  const regionId = useId()

  return (
    <div
      id={id}
      className="absolute inset-x-0 top-0 -z-[5] animate-slide-down overflow-hidden rounded-b-3xl bg-white pt-16 shadow-kit-lg lg:hidden"
    >
      <div aria-hidden="true" className="container-page border-t border-st-secondary" />
      {/* Scrolls below the header row, so long lists never slide under the wordmark. */}
      <div className="max-h-[calc(100dvh-81px)] overflow-y-auto overscroll-contain">
        <nav aria-label="Menu" className="container-page pt-5 pb-6">
          <ul>
            <li className="border-b border-st">
              <button
                type="button"
                aria-expanded={productsOpen}
                aria-controls={regionId}
                onClick={() => setProductsOpen((o) => !o)}
                className={row}
              >
                Products
                <ChevronDown
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className={cn(
                    'size-[18px] shrink-0 text-tx-tertiary transition-transform duration-300 ease-standard',
                    productsOpen && 'rotate-180',
                  )}
                />
              </button>
              <div
                id={regionId}
                inert={!productsOpen}
                className={cn(
                  'grid transition-[grid-template-rows,opacity] duration-[240ms] ease-region',
                  productsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                )}
              >
                <div className="overflow-hidden">
                  <ul className="flex flex-col gap-1 pb-5">
                    {products.map((p) => (
                      <li key={p.id}>
                        <ProductMenuItem product={p} onClick={onNavigate} className="-mx-1" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
            <li className="border-b border-st">
              <Link to="/apis" onClick={onNavigate} className={row}>
                APIs
                <ArrowRight
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="size-[18px] shrink-0 text-tx-tertiary"
                />
              </Link>
            </li>
            <li className="border-b border-st">
              <Link to="/status" onClick={onNavigate} className={row}>
                <span className="inline-flex items-center gap-2.5">
                  Status
                  <HealthDot status={aggregate.status} className="size-2" />
                </span>
                <ArrowRight
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="size-[18px] shrink-0 text-tx-tertiary"
                />
              </Link>
            </li>
          </ul>

          <div className="mt-7 grid grid-cols-2 gap-2.5">
            <Button asChild variant="ink" size="lg" block>
              <a href={studioUrl} target="_blank" rel="noopener noreferrer" onClick={onNavigate}>
                Open AI Studio
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </Button>
            <Button asChild variant="soft" size="lg" block>
              <Link to="/apis" onClick={onNavigate}>
                View APIs
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </div>
  )
}
