import { SearchX } from 'lucide-react'
import { useCallback, useMemo, useState, type CSSProperties } from 'react'

import { ApiCard } from '@/components/apis/ApiCard'
import { ApiDetailsTable } from '@/components/apis/ApiDetailsTable'
import {
  apiEntries,
  apiEntryIds,
  matchesFilter,
  matchesQuery,
  type ApiFilter,
} from '@/components/apis/entries'
import { NeedHelp } from '@/components/apis/NeedHelp'
import { PillFilter, type PillOption } from '@/components/apis/PillFilter'
import { SearchField } from '@/components/apis/SearchField'
import { ServerRow } from '@/components/apis/ServerRow'
import { useRowFocus } from '@/components/apis/useRowFocus'
import { PageHero } from '@/components/primitives/PageHero'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import { Button } from '@/components/ui/button'
import { site } from '@/config/site'
import { useHealth } from '@/hooks/useHealth'
import { useReveal } from '@/hooks/useReveal'

const filters: readonly PillOption<ApiFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'console', label: 'Consoles' },
  { value: 'api', label: 'API only' },
]

const description =
  'Base URLs, health checks and docs for every ET AI service: AI Creative Studio, the AI Calling Bot, TCC Video Verification and the Marathon chatbot.'

export default function ApisPage() {
  const { results } = useHealth()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ApiFilter>('all')
  const [open, setOpen] = useState<string[]>([])

  const visible = useMemo(
    () => apiEntries.filter((e) => matchesFilter(e, filter) && matchesQuery(e, query)),
    [filter, query],
  )
  const cards = visible.filter((e) => e.id !== 'server')
  const server = visible.find((e) => e.id === 'server')

  const openRow = useCallback(
    (id: string) => {
      // A deep link always wins over the current search and filter.
      const entry = apiEntries.find((e) => e.id === id)
      if (entry && !(matchesFilter(entry, filter) && matchesQuery(entry, query))) {
        setFilter('all')
        setQuery('')
      }
      setOpen((prev) => (prev.includes(id) ? prev : [...prev, id]))
    },
    [filter, query],
  )

  const focusRow = useRowFocus((id) => apiEntryIds.has(id), openRow)

  const gridRef = useReveal<HTMLDivElement>()
  const headingRef = useReveal<HTMLDivElement>()

  const reset = () => {
    setQuery('')
    setFilter('all')
  }

  return (
    <>
      <title>{`APIs · ${site.name}`}</title>
      <meta name="description" content={description} />

      <div className="flex flex-col gap-20 md:gap-32">
        <div className="flex flex-col items-center">
          <PageHero
            title="APIs"
            subtitle="Base URLs, health checks and docs for every ET AI service. Copy a URL, or open the docs."
          >
            <div className="mt-10 flex w-full flex-col items-center gap-8 md:mt-16 md:gap-10">
              <SearchField
                value={query}
                onChange={setQuery}
                label="Search APIs"
                placeholder="Search by name, description or URL"
                className="md:w-10/12 lg:max-w-[880px]"
              />
              <PillFilter
                options={filters}
                value={filter}
                onChange={setFilter}
                label="Filter APIs"
                layoutId="apis-filter-pill"
              />
            </div>
          </PageHero>

          <section aria-label="API catalogue" className="container-page mt-10 md:mt-20">
            <output aria-live="polite" className="sr-only">
              {visible.length === apiEntries.length
                ? ''
                : `${visible.length} of ${apiEntries.length} APIs shown`}
            </output>
            {visible.length > 0 ? (
              <div className="flex flex-col gap-4 md:gap-6 lg:gap-10">
                {cards.length > 0 && (
                  <div
                    ref={gridRef}
                    data-reveal-stagger=""
                    className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-10"
                  >
                    {cards.map((entry, i) => (
                      <ApiCard
                        key={entry.id}
                        entry={entry}
                        result={results[entry.id]}
                        index={i}
                        onDetails={(id) => focusRow(id, { moveFocus: true })}
                        style={{ '--i': i } as CSSProperties}
                        className="w-full md:w-[calc((100%-24px)/2)] lg:w-[calc((100%-80px)/3)]"
                      />
                    ))}
                  </div>
                )}
                {server && (
                  <ServerRow
                    entry={server}
                    result={results[server.id]}
                    onDetails={(id) => focusRow(id, { moveFocus: true })}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-st px-6 py-16 text-center">
                <SearchX aria-hidden="true" strokeWidth={1.5} className="size-6 text-tx-tertiary" />
                <p className="text-body-lg text-tx-secondary">
                  No APIs match{query.trim() ? ` "${query.trim()}"` : ' this filter'}
                </p>
                <Button variant="soft" size="sm" onClick={reset}>
                  Clear search
                </Button>
              </div>
            )}
          </section>
        </div>

        {visible.length > 0 && (
          <section
            aria-labelledby="api-details-title"
            className="container-page flex flex-col items-center gap-8 md:gap-12"
          >
            <div ref={headingRef} data-reveal="" className="w-full">
              <SectionHeading
                id="api-details-title"
                title={'Every endpoint,\nready to copy'}
                intro="Open an API to copy its base URL, health check, console or docs."
              />
            </div>
            <ApiDetailsTable
              entries={visible}
              results={results}
              open={open}
              onOpenChange={setOpen}
              className="lg:w-9/12"
            />
          </section>
        )}

        <div className="container-page flex justify-center">
          <NeedHelp className="lg:w-9/12" />
        </div>
      </div>
    </>
  )
}
