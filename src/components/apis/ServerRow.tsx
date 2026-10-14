import { Check, Copy } from 'lucide-react'

import { StatusChip } from '@/components/product/StatusChip'
import { Button } from '@/components/ui/button'
import { useCopy } from '@/hooks/useCopy'
import type { HealthResult } from '@/lib/health'
import { cn } from '@/lib/utils'

import type { ApiEntry } from './entries'
import { ServiceTile } from './ServiceTile'

interface ServerRowProps {
  entry: ApiEntry
  result: HealthResult | undefined
  onDetails: (id: string) => void
  className?: string
}

/** The shared gateway server as a slim row under the catalogue grid. */
export function ServerRow({ entry, result, onDetails, className }: ServerRowProps) {
  const { copied, copy } = useCopy()
  return (
    <article
      aria-labelledby="server-row-title"
      className={cn(
        'flex flex-col gap-5 rounded-2xl border border-st-secondary bg-white p-5 transition-colors duration-200 ease-standard hover:border-st sm:flex-row sm:items-center sm:gap-6 md:px-8 md:py-6',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <ServiceTile id={entry.id} size={52} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3
              id="server-row-title"
              className="font-display text-xl leading-tight font-medium text-tx"
            >
              {entry.name}
            </h3>
            <StatusChip status={result?.status ?? 'checking'} size="sm" />
          </div>
          <p className="text-caption text-pretty text-tx-tertiary">
            The shared host behind every service.{' '}
            <code className="font-mono text-[13px] text-tx-secondary">{entry.healthPath}</code>{' '}
            confirms the gateway itself is up.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => void copy(entry.healthUrl, 'Health URL copied')}
        >
          {copied ? (
            <Check aria-hidden="true" strokeWidth={2} />
          ) : (
            <Copy aria-hidden="true" strokeWidth={1.75} />
          )}
          {copied ? 'Copied' : 'Copy health URL'}
        </Button>
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
