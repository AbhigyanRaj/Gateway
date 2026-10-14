import { useId, useLayoutEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

export interface PillOption<T extends string> {
  value: T
  label: string
  /** Optional count shown after the label. */
  count?: number
}

interface PillFilterProps<T extends string> {
  options: readonly PillOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Accessible name of the radio group (visually hidden legend). */
  label: string
  /**
   * 'pill': the catalogue filter (display-serif labels, black glossy pill).
   * 'segmented': the compact events-style control in a white rounded track.
   */
  variant?: 'pill' | 'segmented'
  className?: string
}

/**
 * Single-choice filter built on native radio inputs (so arrow keys, focus
 * and form semantics come for free). One indicator slides to the active
 * option over 0.45s on the kit's spring curve. It is placed with plain CSS
 * transitions (no animation library) and re-placed without animating when
 * the layout changes (resize, web-font swap, wrapping).
 */
export function PillFilter<T extends string>({
  options,
  value,
  onChange,
  label,
  variant = 'pill',
  className,
}: PillFilterProps<T>) {
  const name = useId()
  const pill = variant === 'pill'
  const root = useRef<HTMLFieldSetElement>(null)
  const indicator = useRef<HTMLSpanElement>(null)
  const placed = useRef('')

  useLayoutEffect(() => {
    const fieldset = root.current
    const el = indicator.current
    if (!fieldset || !el) return

    const place = (animate: boolean) => {
      const target = fieldset.querySelector<HTMLElement>('label[data-active]')
      if (!target) return
      const box = `${target.offsetLeft},${target.offsetTop},${target.offsetWidth},${target.offsetHeight}`
      if (box === placed.current) return
      const first = placed.current === ''
      placed.current = box
      if (first || !animate) el.style.transitionProperty = 'none'
      el.style.width = `${target.offsetWidth}px`
      el.style.height = `${target.offsetHeight}px`
      el.style.transform = `translate(${target.offsetLeft}px, ${target.offsetTop}px)`
      el.style.opacity = '1'
      if (first || !animate) {
        // Commit the jump, then restore the transition for the next change.
        void el.offsetWidth
        el.style.transitionProperty = ''
      }
    }

    place(true)
    const observer = new ResizeObserver(() => place(false))
    observer.observe(fieldset)
    fieldset.querySelectorAll('label').forEach((l) => observer.observe(l))
    return () => observer.disconnect()
  }, [value, options])

  return (
    <fieldset
      ref={root}
      className={cn(
        'relative m-0 min-w-0 border-0 p-0',
        pill
          ? 'flex flex-wrap items-center justify-center gap-1 sm:gap-2'
          : 'inline-flex items-center rounded-full border border-st-secondary bg-white p-1',
        className,
      )}
    >
      <legend className="sr-only">{label}</legend>
      <span
        ref={indicator}
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute top-0 left-0 rounded-full opacity-0',
          'transition-[transform,width,height] duration-[450ms] ease-spring motion-reduce:transition-none',
          pill
            ? 'border-2 border-sf/25 bg-black shadow-[inset_0_0_12px_rgba(255,255,255,0.3)]'
            : 'bg-tx',
        )}
      />
      {options.map((option) => {
        const active = option.value === value
        return (
          <label
            key={option.value}
            data-active={active || undefined}
            className={cn(
              'relative isolate inline-flex cursor-pointer items-center justify-center rounded-full whitespace-nowrap transition-colors duration-200 ease-standard select-none',
              'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-indigo-400',
              pill
                ? 'min-h-11 px-4 py-2.5 font-display text-lg leading-[1.35] font-medium sm:min-h-12 sm:px-6 sm:py-3'
                : 'min-h-10 px-4 text-caption',
              active
                ? pill
                  ? 'text-tx-inverse'
                  : 'font-medium text-sf'
                : pill
                  ? 'text-tx hover:text-tx-secondary'
                  : 'text-tx-secondary hover:text-tx',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={active}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
            {option.count !== undefined && (
              <span
                className={cn(
                  'ml-1.5 tabular',
                  active ? 'text-sf/70' : 'text-tx-tertiary',
                  pill && 'font-sans text-caption',
                )}
              >
                {option.count}
              </span>
            )}
          </label>
        )
      })}
    </fieldset>
  )
}
