import { ArrowUpRight, Check, Copy } from 'lucide-react'
import type { CSSProperties } from 'react'

import { ExternalLink } from '@/components/primitives/ExternalLink'
import { StatusChip } from '@/components/product/StatusChip'
import { Button } from '@/components/ui/button'
import { useCopy } from '@/hooks/useCopy'
import type { HealthResult } from '@/lib/health'
import { cn } from '@/lib/utils'

import type { ApiEntry } from './entries'
import { ServiceTile } from './ServiceTile'

interface ApiCardProps {
  entry: ApiEntry
  result: HealthResult | undefined
  /** Position in the grid; staggers the bloom and desyncs the float. */
  index: number
  onDetails: (id: string) => void
  className?: string
  style?: CSSProperties
}

/** The 112px glossy product tile: blooms in once, then floats gently (static under reduced motion). */
function CardArt({ entry, index }: { entry: ApiEntry; index: number }) {
  const bloomDelay = index * 120
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative grid size-28 shrink-0 place-items-center"
    >
      <span className="absolute -inset-6 rounded-full bg-[radial-gradient(circle,#a5bbfc66_0%,#d5e2ff33_45%,transparent_70%)] opacity-0 transition-opacity duration-500 ease-standard group-hover:opacity-100" />
      <span
        className="block animate-bloom motion-reduce:animate-none"
        style={{ animationDelay: `${bloomDelay}ms` }}
      >
        <span
          className={cn(
            'block motion-reduce:animate-none',
            index % 2 ? 'animate-float-2' : 'animate-float',
          )}
          style={{ animationDelay: `${bloomDelay + 900 + index * 400}ms` }}
        >
          <span className="block transition-[rotate,scale,filter] duration-500 ease-standard group-hover:scale-110 group-hover:rotate-6 group-hover:brightness-105">
            <ServiceTile id={entry.id} size={112} />
          </span>
        </span>
      </span>
    </div>
  )
}

function CopyButton({ label, value }: { label: string; value: string }) {
  const { copied, copy } = useCopy()
  return (
    <Button variant="outline" size="sm" onClick={() => void copy(value, `${label} copied`)}>
      {copied ? (
        <Check aria-hidden="true" strokeWidth={2} />
      ) : (
        <Copy aria-hidden="true" strokeWidth={1.75} />
      )}
      {copied ? 'Copied' : `Copy ${label.charAt(0).toLowerCase()}${label.slice(1)}`}
    </Button>
  )
}

/** Catalogue card (kit models pattern): art, display title, 3-line description, CTA pair. */
export function ApiCard({ entry, result, index, onDetails, className, style }: ApiCardProps) {
  const status = result?.status ?? 'checking'
  return (
    <article
      aria-labelledby={`${entry.id}-card-title`}
      style={style}
      className={cn(
        'group relative flex flex-col items-center gap-6 rounded-2xl border border-st-secondary bg-white px-6 pt-16 pb-8 text-center transition-colors duration-200 ease-standard hover:border-st md:pb-10 lg:px-8',
        className,
      )}
    >
      <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-2">
        {entry.signInRequired ? (
          <span
            title="The console asks you to sign in"
            className="rounded-full border border-indigo-800 bg-indigo-100 px-3 py-0.5 text-caption font-medium text-indigo-800"
          >
            Sign-in
          </span>
        ) : (
          <span />
        )}
        <StatusChip status={status} size="sm" />
      </div>

      <CardArt entry={entry} index={index} />

      <div className="flex flex-col gap-2.5">
        <h3
          id={`${entry.id}-card-title`}
          className="line-clamp-2 font-display text-2xl leading-[1.2] font-medium tracking-[-0.01em] text-balance text-tx"
        >
          {entry.name}
        </h3>
        <p className="line-clamp-3 text-body leading-[1.45] text-pretty text-tx-tertiary">
          {entry.description}
        </p>
      </div>

      <div className="mt-auto flex flex-wrap justify-center gap-3 md:max-lg:[&>*]:px-4">
        {entry.consoleUrl ? (
          <Button asChild variant="outline" size="sm">
            <ExternalLink href={entry.consoleUrl}>
              {entry.consoleLabel ?? 'Open console'}
              <ArrowUpRight aria-hidden="true" strokeWidth={1.75} />
            </ExternalLink>
          </Button>
        ) : (
          <CopyButton label="Base URL" value={entry.baseUrl} />
        )}
        <Button
          variant="ghost"
          size="sm"
          aria-label={`${entry.name} details`}
          onClick={() => onDetails(entry.id)}
        >
          Details
        </Button>
      </div>
    </article>
  )
}
