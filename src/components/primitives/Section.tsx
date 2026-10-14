import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/utils'

interface SectionProps extends React.ComponentProps<'section'> {
  /** Scroll reveal style (md+ only). Default 'fade'. */
  reveal?: 'fade' | 'scale' | false
  /** Wrap children in the kit container. Default true. */
  contained?: boolean
}

/**
 * A page section: kit container + vertical stack with the heading→content gap
 * (32px mobile / 48px desktop) + fade-up reveal.
 */
export function Section({
  reveal = 'fade',
  contained = true,
  className,
  children,
  ...props
}: SectionProps) {
  const ref = useReveal<HTMLElement>()
  return (
    <section
      ref={ref}
      data-reveal={reveal === false ? undefined : reveal === 'scale' ? 'scale' : ''}
      className={cn(
        'relative flex flex-col items-center gap-8 md:gap-12',
        contained && 'container-page',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  )
}
