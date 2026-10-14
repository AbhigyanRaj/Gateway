import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Kit pill button. Variants mirror the design kit:
 * - ink: deep slate pill with inset bevel + cursor glow (primary)
 * - soft: #f5f5f5 pill, turns white on hover (secondary)
 * - hero / heroOutline: 52px display-font hero CTAs
 * - outline: white pill with hairline ring
 * - ghost: text-only pill
 */
const buttonVariants = cva(
  [
    'group/btn relative isolate inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full',
    'touch-manipulation font-sans font-medium whitespace-nowrap select-none',
    'transition-[background-color,background-image,box-shadow,color,transform] duration-[350ms] ease-standard',
    'active:scale-[0.96] active:duration-150',
    'disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        ink: 'bg-ink text-white shadow-btn-ink hover:bg-ink-hover',
        soft: 'bg-sf-secondary text-tx shadow-btn-soft hover:bg-white',
        hero: 'bg-(image:--gradient-btn-primary) text-white hover:bg-(image:--gradient-btn-primary-hover) active:scale-[0.97]',
        heroOutline:
          'bg-(image:--gradient-btn-outline) text-ink-deep shadow-btn-outline active:scale-[0.97]',
        outline: 'bg-white text-tx shadow-[inset_0_0_0_1px_var(--color-st)] hover:bg-sf-secondary',
        ghost: 'text-tx-secondary hover:bg-sf-secondary hover:text-tx',
        inverse: 'bg-white text-ink shadow-btn-soft hover:bg-sf-secondary',
      },
      size: {
        sm: 'min-h-10 px-5 py-2 text-nav',
        md: 'min-h-10 px-5 py-2.5 text-body',
        lg: 'min-h-12 px-6 py-3 text-[17px]',
        hero: 'min-h-[52px] px-6 py-3.5 font-display text-body leading-6 font-medium',
        icon: 'size-10 p-0',
      },
      block: { true: 'w-full', false: '' },
    },
    compoundVariants: [
      {
        variant: ['hero', 'heroOutline'],
        size: undefined,
        class: 'min-h-[52px] px-6 py-3.5 font-display leading-6',
      },
    ],
    defaultVariants: { variant: 'ink', size: 'md', block: false },
  },
)

const glowVariants = new Set(['ink', 'hero'])

export interface ButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Trailing arrow that plays the kit's arrow-loop on hover. */
  arrow?: boolean
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 group-hover/btn:animate-arrow-loop"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

/** Sets --gx/--gy so the radial glow follows the pointer. */
function onPointerMove(e: React.PointerEvent<HTMLElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--gx', `${e.clientX - r.left}px`)
  el.style.setProperty('--gy', `${e.clientY - r.top}px`)
}

function Button({
  className,
  variant,
  size,
  block,
  asChild = false,
  arrow = false,
  children,
  onPointerMove: userPointerMove,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'
  const glow = glowVariants.has(variant ?? 'ink')

  // With asChild, the child element (e.g. <a>/<Link>) receives our decorations.
  const decorate = (content: React.ReactNode) => (
    <>
      {glow && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 ease-standard group-hover/btn:opacity-100"
          style={{
            background:
              'radial-gradient(circle 80px at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,0.16) 0%, transparent 100%)',
          }}
        />
      )}
      <span className="relative inline-flex items-center gap-2">
        {content}
        {arrow && <ArrowIcon />}
      </span>
    </>
  )

  const content =
    asChild && React.isValidElement<{ children?: React.ReactNode }>(children)
      ? React.cloneElement(children, undefined, decorate(children.props.children))
      : decorate(children)

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, block }), className)}
      onPointerMove={(e: React.PointerEvent<HTMLButtonElement>) => {
        if (glow) onPointerMove(e)
        userPointerMove?.(e)
      }}
      {...props}
    >
      {content}
    </Comp>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
