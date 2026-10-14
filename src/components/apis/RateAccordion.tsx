import { ChevronDown } from 'lucide-react'
import { createContext, use, type KeyboardEvent, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * The kit's "rate table" accordion (pricing page): one bordered card, a row
 * per item, 64/80px triggers, an open state in indigo-800 and a panel that
 * animates grid-template-rows 0fr → 1fr over 240ms. Rows inside the panel
 * stagger in by 24ms (use `rowReveal` + `--i`).
 *
 * Built in-house (rather than on Radix) because Radix freezes transitions
 * while it measures, which kills the grid-rows animation.
 */

interface AccordionCtx {
  open: readonly string[]
  toggle: (id: string) => void
}
const Ctx = createContext<AccordionCtx | null>(null)
const ItemCtx = createContext<{ id: string; open: boolean } | null>(null)

function useItem() {
  const item = use(ItemCtx)
  if (!item) throw new Error('RateAccordion parts must be inside <RateItem>')
  return item
}

interface RateAccordionProps {
  /** Ids of the open items (type="multiple"). */
  value: readonly string[]
  onValueChange: (value: string[]) => void
  className?: string
  children: ReactNode
}

/** Up/Down/Home/End move focus between triggers (WAI-ARIA accordion pattern). */
function onTriggerKeys(e: KeyboardEvent<HTMLButtonElement>) {
  const target = e.currentTarget
  const root = target.closest('[data-rate-accordion]')
  if (!root) return
  const triggers = [...root.querySelectorAll<HTMLElement>('[data-rate-trigger]')]
  const i = triggers.indexOf(target)
  const next =
    e.key === 'ArrowDown'
      ? triggers[(i + 1) % triggers.length]
      : e.key === 'ArrowUp'
        ? triggers[(i - 1 + triggers.length) % triggers.length]
        : e.key === 'Home'
          ? triggers[0]
          : e.key === 'End'
            ? triggers[triggers.length - 1]
            : null
  if (next) {
    e.preventDefault()
    next.focus()
  }
}

export function RateAccordion({ value, onValueChange, className, children }: RateAccordionProps) {
  const toggle = (id: string) =>
    onValueChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  return (
    <Ctx value={{ open: value, toggle }}>
      <div
        data-rate-accordion=""
        className={cn(
          'w-full overflow-hidden rounded-2xl border border-st-secondary bg-white md:rounded-[20px]',
          className,
        )}
      >
        {children}
      </div>
    </Ctx>
  )
}

export function RateItem({
  id,
  className,
  children,
}: {
  id: string
  className?: string
  children: ReactNode
}) {
  const ctx = use(Ctx)
  const open = !!ctx?.open.includes(id)
  return (
    <ItemCtx value={{ id, open }}>
      <div
        id={id}
        data-state={open ? 'open' : 'closed'}
        className={cn('group/item border-b border-st-secondary last:border-b-0', className)}
      >
        {children}
      </div>
    </ItemCtx>
  )
}

export function RateTrigger({
  className,
  children,
  'aria-label': ariaLabel,
}: {
  className?: string
  children: ReactNode
  'aria-label'?: string
}) {
  const ctx = use(Ctx)
  const { id, open } = useItem()
  return (
    <h3 className="flex">
      <button
        type="button"
        id={`${id}-trigger`}
        data-rate-trigger=""
        data-state={open ? 'open' : 'closed'}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        aria-label={ariaLabel}
        onClick={() => ctx?.toggle(id)}
        onKeyDown={onTriggerKeys}
        className={cn(
          'group/trigger flex min-h-16 w-full items-center gap-4 px-5 py-3.5 text-left text-tx transition-colors duration-200 ease-standard sm:px-6 md:min-h-20 md:px-8 md:py-4',
          'hover:bg-sf-secondary focus-visible:outline-offset-[-2px] active:bg-sf-tertiary',
          className,
        )}
      >
        {children}
      </button>
    </h3>
  )
}

/** 16px chevron that flips and turns indigo when the item is open. */
export function RateChevron({ className }: { className?: string }) {
  return (
    <ChevronDown
      aria-hidden="true"
      strokeWidth={1.5}
      className={cn(
        'size-4 shrink-0 text-tx-secondary transition-[rotate,color] duration-200 ease-standard group-data-[state=open]/trigger:rotate-180 group-data-[state=open]/trigger:text-indigo-800',
        className,
      )}
    />
  )
}

/** Text/icon colour that flips to indigo-800 when the item is open. */
export const openTone =
  'transition-colors duration-200 group-data-[state=open]/trigger:text-indigo-800'

export function RateContent({ className, children }: { className?: string; children: ReactNode }) {
  const { id, open } = useItem()
  return (
    <section
      id={`${id}-panel`}
      aria-labelledby={`${id}-trigger`}
      data-state={open ? 'open' : 'closed'}
      className="group/region grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-240 ease-region data-[state=open]:grid-rows-[1fr] data-[state=open]:opacity-100"
    >
      <div className="min-h-0 overflow-hidden" inert={!open}>
        <div className={cn('border-t border-st-secondary bg-sf-secondary/40', className)}>
          {children}
        </div>
      </div>
    </section>
  )
}

/** Mono uppercase column-header band (decorative; hidden on mobile). */
export function RateHead({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'hidden gap-6 border-b border-st-secondary px-6 py-2.5 font-mono text-label tracking-[0.08em] text-tx-tertiary uppercase md:grid md:px-8',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Panel rows fade and rise in, staggered 24ms apart (set `--i` on each row). */
export const rowReveal =
  'translate-y-1 opacity-0 transition-[opacity,translate] duration-200 ease-standard group-data-[state=open]/region:translate-y-0 group-data-[state=open]/region:opacity-100 group-data-[state=open]/region:[transition-delay:calc(var(--i,0)*24ms)]'
