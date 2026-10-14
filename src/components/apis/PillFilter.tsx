import { motion, useReducedMotion } from 'motion/react'
import { useId } from 'react'

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
  /** Unique id for the sliding indicator (motion layoutId). */
  layoutId: string
  /**
   * 'pill': the catalogue filter (display-serif labels, black glossy pill).
   * 'segmented': the compact events-style control in a white rounded track.
   */
  variant?: 'pill' | 'segmented'
  className?: string
}

/**
 * Single-choice filter built on native radio inputs (so arrow keys, focus
 * and form semantics come for free). The active pill slides over 0.45s on
 * the kit's spring curve.
 */
export function PillFilter<T extends string>({
  options,
  value,
  onChange,
  label,
  layoutId,
  variant = 'pill',
  className,
}: PillFilterProps<T>) {
  const name = useId()
  const reduced = useReducedMotion()
  const pill = variant === 'pill'

  return (
    <fieldset
      className={cn(
        'm-0 min-w-0 border-0 p-0',
        pill
          ? 'flex flex-wrap items-center justify-center gap-1 sm:gap-2'
          : 'inline-flex items-center rounded-full border border-st-secondary bg-white p-1',
        className,
      )}
    >
      <legend className="sr-only">{label}</legend>
      {options.map((option) => {
        const active = option.value === value
        return (
          <label
            key={option.value}
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
            {active && (
              <motion.span
                layoutId={layoutId}
                aria-hidden="true"
                transition={{ duration: reduced ? 0 : 0.45, ease: [0.34, 1.1, 0.64, 1] }}
                className={cn(
                  'absolute inset-0 -z-10 rounded-full',
                  pill
                    ? 'border-2 border-sf/25 bg-black shadow-[inset_0_0_12px_rgba(255,255,255,0.3)]'
                    : 'bg-tx',
                )}
              />
            )}
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
