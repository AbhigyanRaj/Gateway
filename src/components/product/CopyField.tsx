import { ArrowUpRight, Check, Copy } from 'lucide-react'

import { useCopy } from '@/hooks/useCopy'
import { cn } from '@/lib/utils'

const iconButton =
  'relative inline-flex size-8 shrink-0 items-center justify-center rounded-full text-tx-tertiary transition-colors duration-200 ease-standard hover:bg-sf-tertiary hover:text-tx active:scale-[0.94] after:absolute after:-inset-1'

/** Splits an absolute URL into a muted origin and an emphasised path. */
function splitUrl(value: string): [string, string] {
  const match = /^(https?:\/\/[^/]+)(.*)$/.exec(value)
  return match ? [match[1], match[2] || '/'] : ['', value]
}

interface CopyValueProps {
  value: string
  className?: string
}

/** The value itself: mono, origin muted, truncated on one line from md (wraps on mobile). */
export function CopyValue({ value, className }: CopyValueProps) {
  const [origin, path] = splitUrl(value)
  return (
    <code
      title={value}
      className={cn(
        'block min-w-0 font-mono text-[12.5px] leading-6 [overflow-wrap:anywhere] text-tx sm:text-[13px] md:truncate md:text-sm',
        className,
      )}
    >
      {origin && (
        <span className="text-tx-tertiary">
          {/* The protocol is dropped on phones to keep the URL on one line; copy is always the full URL. */}
          <span className="max-sm:hidden">{origin.slice(0, origin.indexOf('//') + 2)}</span>
          {origin.slice(origin.indexOf('//') + 2)}
        </span>
      )}
      {path}
    </code>
  )
}

interface CopyActionsProps {
  /** Human label, used for aria-labels and the toast ("Copy Base URL"). */
  label: string
  value: string
  /** Open-in-new-tab target. Defaults to `value`; pass `false` to hide the link. */
  href?: string | false
  className?: string
}

/** Copy + open-in-new-tab icon buttons. */
export function CopyActions({ label, value, href, className }: CopyActionsProps) {
  const { copied, copy } = useCopy()
  const target = href === undefined ? value : href
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        type="button"
        aria-label={`Copy ${label}`}
        onClick={() => void copy(value, `${label} copied`)}
        className={iconButton}
      >
        {copied ? (
          <Check aria-hidden="true" strokeWidth={1.75} className="size-4 text-green-600" />
        ) : (
          <Copy aria-hidden="true" strokeWidth={1.5} className="size-4" />
        )}
      </button>
      {target && (
        <a
          href={target}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${label} in a new tab`}
          className={iconButton}
        >
          <ArrowUpRight aria-hidden="true" strokeWidth={1.5} className="size-4" />
        </a>
      )}
    </div>
  )
}

interface CopyFieldProps extends CopyActionsProps {
  valueClassName?: string
}

/** A copyable value (usually a URL): mono value + copy + open link. */
export function CopyField({ label, value, href, className, valueClassName }: CopyFieldProps) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2', className)}>
      <CopyValue value={value} className={cn('flex-1', valueClassName)} />
      <CopyActions label={label} value={value} href={href} />
    </div>
  )
}
