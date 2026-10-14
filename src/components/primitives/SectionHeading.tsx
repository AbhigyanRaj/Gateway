import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  /** Supports a manual line break with "\n" (rendered via white-space: pre-line). */
  title: React.ReactNode
  eyebrow?: string
  intro?: React.ReactNode
  align?: 'center' | 'left'
  /** Heading level, h2 by default. */
  as?: 'h1' | 'h2' | 'h3'
  id?: string
  className?: string
  children?: React.ReactNode
}

/** Centred (or left) kit section heading: eyebrow → display H2 → intro. */
export function SectionHeading({
  title,
  eyebrow,
  intro,
  align = 'center',
  as: Tag = 'h2',
  id,
  className,
  children,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Tag id={id} className="h-section">
        {title}
      </Tag>
      {intro && <p className="text-intro">{intro}</p>}
      {children}
    </div>
  )
}
