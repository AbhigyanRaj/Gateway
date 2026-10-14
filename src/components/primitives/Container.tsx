import { cn } from '@/lib/utils'

/** Kit container: 88% → 83.333% (md) → max 1400px (2xl). */
export function Container({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('container-page', className)} {...props} />
}
