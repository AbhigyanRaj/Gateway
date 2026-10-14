import { Info, RotateCw } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { apiEntries, apiEntryIds } from '@/components/apis/entries'
import { PillFilter, type PillOption } from '@/components/apis/PillFilter'
import { useRowFocus } from '@/components/apis/useRowFocus'
import { PageHero } from '@/components/primitives/PageHero'
import { StatusChip } from '@/components/product/StatusChip'
import { Ago } from '@/components/status/Ago'
import { MetricBand } from '@/components/status/MetricBand'
import { StatusTable } from '@/components/status/StatusTable'
import { Button } from '@/components/ui/button'
import { site } from '@/config/site'
import { useHealth } from '@/hooks/useHealth'
import { POLL_MS, statusCopy, type HealthResult } from '@/lib/health'
import { cn } from '@/lib/utils'

type StatusFilter = 'all' | 'operational' | 'issues'

const legend = [
  ['Operational', 'bg-green-500'],
  ['Degraded', 'bg-yellow-500'],
  ['Down', 'bg-red-400'],
  ['Not checked yet', 'bg-grey-300'],
] as const

const isIssue = (r: HealthResult | undefined) => r?.status === 'degraded' || r?.status === 'down'

const description =
  'Live health for every ET AI service, checked from your browser every 30 seconds: AI Creative Studio, the AI Calling Bot, TCC Video Verification, the Marathon chatbot and the gateway server.'

export default function StatusPage() {
  const { results, aggregate, isFetching, refetch } = useHealth()
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [open, setOpen] = useState<string[]>([])

  const counts = useMemo(() => {
    const all = apiEntries.map((e) => results[e.id])
    return {
      all: apiEntries.length,
      operational: all.filter((r) => r?.status === 'operational').length,
      issues: all.filter(isIssue).length,
    }
  }, [results])

  const visible = apiEntries.filter((e) =>
    filter === 'all'
      ? true
      : filter === 'issues'
        ? isIssue(results[e.id])
        : results[e.id]?.status === 'operational',
  )

  const filters: readonly PillOption<StatusFilter>[] = [
    { value: 'all', label: 'All', count: counts.all },
    { value: 'operational', label: 'Operational', count: counts.operational },
    { value: 'issues', label: 'Issues', count: counts.issues },
  ]

  const openRow = useCallback((id: string) => {
    setFilter('all')
    setOpen((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])
  useRowFocus((id) => apiEntryIds.has(id), openRow)

  // Announce only meaningful changes: the summary and which services have issues.
  const announcement = useMemo(() => {
    if (aggregate.status === 'checking') return ''
    const issues = apiEntries
      .filter((e) => isIssue(results[e.id]))
      .map((e) => `${e.name} is ${statusCopy[results[e.id]!.status].label.toLowerCase()}`)
    return [statusCopy[aggregate.status].summary, ...issues].join('. ') + '.'
  }, [aggregate.status, results])

  return (
    <>
      <title>{`Status · ${site.name}`}</title>
      <meta name="description" content={description} />

      <div className="flex flex-col gap-20 md:gap-32">
        <PageHero title="Status">
          <div className="mt-6 flex flex-col items-center gap-4 md:mt-8">
            <StatusChip
              status={aggregate.status}
              label={statusCopy[aggregate.status].summary}
              pulse
              className="text-body"
            />
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
              <p className="text-intro tabular">
                Checked <Ago ts={aggregate.lastCheckedAt} /> · refreshes every {POLL_MS / 1000}s
              </p>
              <Button variant="soft" size="sm" onClick={refetch} aria-busy={isFetching}>
                <RotateCw
                  aria-hidden="true"
                  strokeWidth={1.75}
                  className={cn(isFetching && 'animate-spin [animation-duration:900ms]')}
                />
                Refresh
              </Button>
            </div>
          </div>
          <output aria-live="polite" className="sr-only">
            {announcement}
          </output>
        </PageHero>

        <MetricBand aggregate={aggregate} />

        <section
          aria-labelledby="services-title"
          className="container-page flex flex-col gap-6 md:gap-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2
              id="services-title"
              className="text-[18px] leading-[1.3] font-medium text-tx md:text-[20px]"
            >
              Services
            </h2>
            <PillFilter
              options={filters}
              value={filter}
              onChange={setFilter}
              label="Filter services"
              variant="segmented"
              className="self-start md:self-auto"
            />
          </div>

          <StatusTable
            entries={visible}
            results={results}
            open={open}
            onOpenChange={setOpen}
            emptyLabel={
              filter === 'issues'
                ? 'No issues right now. Every service is operational.'
                : 'No services match.'
            }
          />

          <div className="flex flex-col items-center gap-3 text-center">
            <ul
              aria-label="Response time bars"
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-label text-tx-tertiary"
            >
              <li>Each bar is one check this session, taller is slower</li>
              {legend.map(([label, tone]) => (
                <li key={label} className="inline-flex items-center gap-1.5">
                  <span aria-hidden="true" className={cn('h-3 w-1 rounded-full', tone)} />
                  {label}
                </li>
              ))}
            </ul>
            <p className="max-w-xl text-caption text-pretty text-tx-tertiary">
              <Info
                aria-hidden="true"
                strokeWidth={1.5}
                className="mr-1.5 inline size-4 align-[-3px]"
              />
              Checks run from your browser against each service's health endpoint. History is kept
              for this session only.
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
