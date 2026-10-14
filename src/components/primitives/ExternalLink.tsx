import { cn } from '@/lib/utils'

/** External link with safe rel + a screen-reader hint. */
export function ExternalLink({
  className,
  children,
  ...props
}: React.ComponentProps<'a'>) {
  return (
    <a target="_blank" rel="noopener noreferrer" className={cn(className)} {...props}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}
