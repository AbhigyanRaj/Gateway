import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router'

import { CodeBlock, type CodeSnippet } from '@/components/product/CodeBlock'
import { ScallopBlob, SplitUrl } from '@/components/product/ProductCard'
import { ProductTile } from '@/components/product/ProductTile'
import { StatusDot } from '@/components/product/StatusChip'
import { ExternalLink } from '@/components/primitives/ExternalLink'
import { Section } from '@/components/primitives/Section'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import { Button } from '@/components/ui/button'
import { productUrl } from '@/config/site'
import { productById, products, type Product, type ProductId } from '@/data/products'
import { useHealth } from '@/hooks/useHealth'
import { displayUrl } from '@/lib/format'
import { statusCopy, type HealthResult } from '@/lib/health'
import { cn } from '@/lib/utils'

/* ---------- Request samples (real, per product) ---------- */

/** Products whose note says there is no public API (only a health check). */
const hasNoPublicApi = (p: Product) => !p.publicApi

/** Splits a note into comment lines: one per sentence or aside, word-wrapped to fit. */
function commentLines(text: string, prefix: string, width = 44): string[] {
  const parts = text.split(/(?<=\.)\s+|\s+(?=\()/)
  const lines: string[] = []
  for (const part of parts) {
    let line = ''
    for (const word of part.split(/\s+/)) {
      if (line && `${line} ${word}`.length > width) {
        lines.push(`${prefix} ${line}`)
        line = word
      } else {
        line = line ? `${line} ${word}` : word
      }
    }
    if (line) lines.push(`${prefix} ${line}`)
  }
  return lines
}

function snippetsFor(p: Product): CodeSnippet[] {
  // Signed-in API (e.g. Studio): show the API base and what to expect without a session.
  if (p.apiNote && !hasNoPublicApi(p)) {
    const url = p.apiBase
    return [
      {
        lang: 'curl',
        code: [
          `# ${p.name} API base`,
          ...commentLines(p.apiNote, '#'),
          'curl -sS -i \\',
          '  -H "Accept: application/json" \\',
          `  "${url}"`,
          '',
          '# HTTP 401 when signed out',
        ].join('\n'),
      },
      {
        lang: 'js',
        code: [
          `// ${p.name} API base`,
          ...commentLines(p.apiNote, '//'),
          'const res = await fetch(',
          `  '${url}',`,
          "  { credentials: 'include' },",
          ')',
          '',
          'console.log(res.status) // 401 when signed out',
        ].join('\n'),
      },
      {
        lang: 'python',
        code: [
          'import requests',
          '',
          `# ${p.name} API base`,
          ...commentLines(p.apiNote, '#'),
          'res = requests.get(',
          `    "${url}",`,
          '    timeout=10,',
          ')',
          'print(res.status_code)  # 401 when signed out',
        ].join('\n'),
      },
    ]
  }

  // Everything else: a real health check.
  const url = productUrl(p.healthPath)
  const note = p.apiNote ? p.apiNote : null
  const head = (c: string) => [
    `${c} Health check: ${p.name}`,
    ...(note ? commentLines(note, c) : []),
  ]
  return [
    {
      lang: 'curl',
      code: [
        ...head('#'),
        'curl -sS \\',
        '  -H "Accept: application/json" \\',
        '  -w "\\nHTTP %{http_code} in %{time_total}s\\n" \\',
        `  "${url}"`,
        '',
        '# 200 with a JSON health payload',
      ].join('\n'),
    },
    {
      lang: 'js',
      code: [
        ...head('//'),
        'const res = await fetch(',
        `  '${url}',`,
        "  { headers: { Accept: 'application/json' } },",
        ')',
        'const health = await res.json()',
        '',
        'console.log(res.status, health)',
      ].join('\n'),
    },
    {
      lang: 'python',
      code: [
        'import requests',
        '',
        ...head('#'),
        'res = requests.get(',
        `    "${url}",`,
        '    timeout=10,',
        ')',
        'print(res.status_code, res.json())',
      ].join('\n'),
    },
  ]
}

/* ---------- Helpers ---------- */

const DESKTOP = '(min-width: 64rem)'

/** True at lg+ (matches Tailwind's `lg`). Client-only app, so no SSR mismatch. */
function useIsDesktop() {
  const subscribe = useCallback((cb: () => void) => {
    const m = window.matchMedia(DESKTOP)
    m.addEventListener('change', cb)
    return () => m.removeEventListener('change', cb)
  }, [])
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP).matches,
    () => true,
  )
}

const miniBase = cn(
  '@container relative isolate flex min-h-[176px] w-full flex-col justify-between gap-4 overflow-hidden rounded-xl border bg-white p-5 text-left md:p-8 lg:p-6 xl:min-h-[208px]',
  'transition-[border-color] duration-150 ease-standard',
)

function MiniCardBody({
  product,
  result,
  active,
  colourIcon,
}: {
  product: Product
  result: HealthResult | undefined
  active: boolean
  colourIcon: boolean
}) {
  const status = result?.status ?? 'checking'
  return (
    <>
      <ScallopBlob
        className={cn(
          'absolute -top-8 -right-8 -z-10 size-28 transition-[opacity,rotate,scale] duration-500 ease-out',
          active ? 'scale-100 rotate-12 opacity-100' : 'scale-75 rotate-45 opacity-0',
        )}
      />
      <ProductTile
        id={product.id}
        size={40}
        className={cn(
          '-m-1 transition-[filter,opacity] duration-150 ease-standard',
          !colourIcon && 'opacity-45 grayscale',
        )}
      />
      <span className="flex flex-col gap-1.5">
        <span className="text-body-lg leading-snug font-medium text-balance text-tx lg:text-body">
          {product.name}
          <StatusDot
            status={status}
            pulse
            label={`, ${statusCopy[status].label}`}
            className="ml-2 -translate-y-[3px] align-middle"
          />
        </span>
        <span className="sr-only">{displayUrl(product.apiBase)}</span>
        <SplitUrl
          url={product.apiBase}
          stack
          hostClassName="hidden @min-[11.75rem]:block"
          className="text-[13px] leading-5 text-tx-secondary"
        />
      </span>
    </>
  )
}

/* ---------- Section ---------- */

/**
 * Developer section: an interactive API picker. The 2×2 mini-cards select the
 * product; the code card (lg+) shows a real request for it. Below lg the code
 * card is hidden and the mini-cards link to /apis#id.
 */
export function ApiSection() {
  const { results } = useHealth()
  const isDesktop = useIsDesktop()
  const [activeId, setActiveId] = useState<ProductId>('studio')
  const active = productById[activeId]
  const snippets = useMemo(() => snippetsFor(active), [active])
  const tccDocs = productById.tcc.docsUrl

  return (
    <Section id="apis" aria-labelledby="apis-title">
      <SectionHeading
        id="apis-title"
        title={'Build on\nET AI APIs'}
        intro={
          <span className="block text-balance">
            Base URLs, health checks and docs for every service, ready to call.
          </span>
        }
      />

      <div className="grid w-full gap-2 lg:grid-cols-2">
        {/* Code card (lg+). Absolutely filled so the right column sets the height. */}
        <div className="relative hidden min-h-[520px] lg:block xl:row-span-2">
          <div
            id="api-code"
            className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-st-secondary/50 bg-white p-8 xl:p-12"
          >
            <h3 className="text-[26px] leading-[1.25] font-medium tracking-[-1px] text-tx xl:text-heading-sub xl:leading-[1.25]">
              {hasNoPublicApi(active) ? 'Check' : 'Call'} the{' '}
              <span key={activeId} className="inline-block animate-fade-in text-indigo-600">
                {active.shortName}
              </span>{' '}
              {hasNoPublicApi(active) ? 'health' : 'API'}
              <br />
              in one request
            </h3>
            <CodeBlock
              snippets={snippets}
              contentKey={activeId}
              copyLabel="Request copied"
              className="mt-8 -mb-8 min-h-0 flex-1 xl:-mb-12"
              bodyClassName="pb-40"
            />
            <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,var(--color-indigo-100)_0%,var(--color-indigo-50)_50%,transparent_100%)] p-8 pt-40 xl:p-12 xl:pt-40">
              <Button asChild variant="ink" block>
                <Link to="/apis">View all APIs</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Selector */}
        <div className="grid min-w-0 grid-cols-1 gap-2 min-[360px]:grid-cols-2 xl:grid-cols-3">
          {products.map((p, i) => {
            const result = results[p.id]
            if (isDesktop) {
              const isActive = p.id === activeId
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={isActive}
                  aria-controls="api-code"
                  onMouseEnter={() => setActiveId(p.id)}
                  onFocus={() => setActiveId(p.id)}
                  onClick={() => setActiveId(p.id)}
                  className={cn(
                    miniBase,
                    isActive
                      ? 'border-indigo-200'
                      : 'border-st-secondary/50 hover:border-indigo-200',
                  )}
                >
                  <MiniCardBody
                    product={p}
                    result={result}
                    active={isActive}
                    colourIcon={isActive}
                  />
                </button>
              )
            }
            return (
              <Link
                key={p.id}
                to={`/apis#${p.id}`}
                className={cn(
                  miniBase,
                  i === 0 ? 'border-indigo-200' : 'border-st-secondary/50 hover:border-indigo-200',
                )}
              >
                <MiniCardBody product={p} result={result} active={false} colourIcon />
              </Link>
            )
          })}
        </div>

        {/* Notes: full width at lg, under the selector from xl */}
        <div className="grid min-w-0 gap-2 sm:grid-cols-3 lg:col-span-2 xl:col-span-1">
          <div className="rounded-xl border border-st-secondary/50 bg-white p-6">
            <h3 className="text-heading-card leading-[1.3] font-medium tracking-card text-tx">
              REST + JSON
            </h3>
            <p className="mt-2 text-caption text-tx-tertiary">
              Plain HTTPS endpoints that return JSON.
            </p>
          </div>
          <div className="rounded-xl border border-st-secondary/50 bg-white p-6">
            <h3 className="text-heading-card leading-[1.3] font-medium tracking-card text-tx">
              Health checks
            </h3>
            <p className="mt-2 text-caption text-tx-tertiary">
              A health endpoint on every service, checked every 30s.
            </p>
          </div>
          <ExternalLink
            href={tccDocs}
            className="group rounded-xl border border-st-secondary/50 bg-white p-6 transition-[border-color] duration-200 ease-standard hover:border-indigo-200"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-heading-card leading-[1.3] font-medium tracking-card text-tx">
                Docs
              </span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-[18px] text-st transition-[color,translate] duration-200 ease-standard group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-tx-tertiary"
              >
                <path d="M7 17 17 7M8 7h9v9" />
              </svg>
            </span>
            <span className="mt-2 block text-caption text-tx-tertiary">
              TCC API reference at{' '}
              <code className="font-mono text-[13px] text-tx-secondary underline decoration-st underline-offset-4">
                /tcc/docs
              </code>
            </span>
          </ExternalLink>
        </div>
      </div>
    </Section>
  )
}
