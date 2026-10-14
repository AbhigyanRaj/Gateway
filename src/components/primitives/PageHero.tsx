import { Ornament } from '@/components/brand/Ornament'
import { cn } from '@/lib/utils'

interface PageHeroProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

/** Light inner-page hero (no sunrise): pale ornament → display H1 → subline. */
export function PageHero({ title, subtitle, className, children }: PageHeroProps) {
  return (
    <header
      className={cn(
        'container-page flex flex-col items-center pt-32 text-center md:pt-40',
        className,
      )}
    >
      <Ornament className="h-6 w-auto text-[#e2e2e2] md:h-8" />
      <h1 className="mt-8 h-page md:mt-10">{title}</h1>
      {subtitle && <p className="mt-4 text-intro max-w-2xl md:mt-5">{subtitle}</p>}
      {children}
    </header>
  )
}
