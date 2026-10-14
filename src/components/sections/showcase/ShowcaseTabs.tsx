import { Check, ChevronDown } from 'lucide-react'
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'
import { useRef } from 'react'

import { ProductTile } from '@/components/product/ProductTile'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { products, productById, type ProductId } from '@/data/products'
import { cn } from '@/lib/utils'

import { panelId, tabId } from './ids'

interface TabsProps {
  active: ProductId
  onChange: (id: ProductId) => void
}

/**
 * xl+: equal-width ARIA tabs, one column per product. A single white
 * highlight slides between tabs (transform only); colour swaps take 150ms.
 */
export function ShowcaseTabList({ active, onChange }: TabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const index = products.findIndex((p) => p.id === active)

  const focusTab = (i: number) => {
    const next = (i + products.length) % products.length
    refs.current[next]?.focus()
    onChange(products[next].id)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const keys: Record<string, number> = {
      ArrowRight: i + 1,
      ArrowLeft: i - 1,
      Home: 0,
      End: products.length - 1,
    }
    if (!(e.key in keys)) return
    e.preventDefault()
    focusTab(keys[e.key])
  }

  return (
    <div
      role="tablist"
      aria-label="Products"
      className="relative mb-0.5 hidden overflow-hidden rounded-t-2xl rounded-b-sm bg-sf-tertiary xl:grid"
      style={{ gridTemplateColumns: `repeat(${products.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 bg-white shadow-tab-active transition-transform duration-300 ease-standard"
        style={{ width: `${100 / products.length}%`, transform: `translateX(${index * 100}%)` }}
      />
      {products.map((p, i) => {
        const selected = p.id === active
        return (
          <button
            key={p.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="tab"
            id={tabId(p.id)}
            aria-selected={selected}
            aria-controls={panelId(p.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(p.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              'relative flex min-w-0 items-center justify-center gap-2 px-3 py-3 text-[15px] leading-[1.4] font-medium whitespace-nowrap',
              'transition-colors duration-150 ease-out focus-visible:-outline-offset-2',
              selected ? 'text-indigo-800' : 'text-tx-tertiary hover:text-tx-secondary',
            )}
          >
            <ProductTile
              id={p.id}
              size={20}
              className={cn(
                'transition-[opacity,filter] duration-150 ease-out',
                !selected && 'opacity-80 saturate-[.65]',
              )}
            />
            <span className="truncate">{p.shortName}</span>
          </button>
        )
      })}
    </div>
  )
}

/** Below xl: the tab bar collapses into a single dropdown button. */
export function ShowcaseSelect({ active, onChange }: TabsProps) {
  const current = productById[active]
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group mb-0.5 flex w-full items-center gap-2.5 rounded-t-xl rounded-b-sm bg-white px-5 py-3 text-left text-body leading-[1.35] font-medium text-tx shadow-tab-active transition-colors duration-150 ease-out focus-visible:-outline-offset-2 xl:hidden"
        >
          <ProductTile id={active} size={22} />
          <span className="sr-only">Choose a product: </span>
          <span className="min-w-0 flex-1 truncate">{current.name}</span>
          <ChevronDown
            aria-hidden="true"
            strokeWidth={1.5}
            className="size-5 shrink-0 text-tx-tertiary transition-transform duration-200 ease-standard group-data-[state=open]:rotate-180"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="z-[10001] w-(--radix-dropdown-menu-trigger-width) rounded-xl border-st-secondary bg-white p-1.5 shadow-kit-lg"
      >
        <DropdownMenuRadioGroup value={active} onValueChange={(v) => onChange(v as ProductId)}>
          {products.map((p) => {
            return (
              <DropdownMenuPrimitive.RadioItem
                key={p.id}
                value={p.id}
                className="group/item flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-body font-medium text-tx-secondary outline-none select-none data-[highlighted]:bg-sf-secondary data-[highlighted]:text-tx data-[state=checked]:text-indigo-800"
              >
                <ProductTile id={p.id} size={22} />
                <span className="min-w-0 flex-1 truncate">{p.name}</span>
                <DropdownMenuPrimitive.ItemIndicator>
                  <Check aria-hidden="true" strokeWidth={1.5} className="size-[18px]" />
                </DropdownMenuPrimitive.ItemIndicator>
              </DropdownMenuPrimitive.RadioItem>
            )
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
