import { Activity, AppWindow, BadgeCheck, BookOpen, Braces } from 'lucide-react'
import { useId } from 'react'

import { productArt } from '@/assets/art'
import { LinkRow } from '@/components/product/LinkRow'
import { ProductTile } from '@/components/product/ProductTile'
import { StatusChip } from '@/components/product/StatusChip'
import { accentStyles, type Accent, type Product, type ProductId } from '@/data/products'
import { displayUrl } from '@/lib/format'
import type { HealthResult } from '@/lib/health'
import { cn } from '@/lib/utils'

/* ---------- Scalloped blob (decorative corner flower) ---------- */

/** Scalloped outline: `lobes` outward arcs around a base circle (112×112 box). */
function scallopPath(lobes = 9, radius = 45, bulge = 0.6) {
  const c = 56
  const pts = Array.from({ length: lobes }, (_, i) => {
    const a = (i / lobes) * Math.PI * 2 - Math.PI / 2
    return [c + radius * Math.cos(a), c + radius * Math.sin(a)] as const
  })
  const chord = 2 * radius * Math.sin(Math.PI / lobes)
  const r = (chord * bulge).toFixed(2)
  const f = (n: number) => n.toFixed(2)
  return (
    `M${f(pts[0][0])} ${f(pts[0][1])}` +
    pts
      .map((_, i) => {
        const [x, y] = pts[(i + 1) % lobes]
        return `A${r} ${r} 0 0 1 ${f(x)} ${f(y)}`
      })
      .join('') +
    'Z'
  )
}

const SCALLOP = scallopPath()

/**
 * Soft multi-lobed flower: periwinkle core warming to an amber rim. Sits in a
 * card corner (clipped by the card). Decorative only.
 */
export function ScallopBlob({ className }: { className?: string }) {
  const gid = `blob${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 112 112"
      className={cn('pointer-events-none blur-[0.3px]', className)}
    >
      <defs>
        <radialGradient
          id={gid}
          cx="56"
          cy="56"
          r="54"
          fx="66"
          fy="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#d4defc" />
          <stop offset="0.38" stopColor="#a3b6f4" />
          <stop offset="0.62" stopColor="#8fa6ef" />
          <stop offset="0.78" stopColor="#c9b0b4" />
          <stop offset="0.88" stopColor="#f0b25c" />
          <stop offset="1" stopColor="#f39f2f" />
        </radialGradient>
      </defs>
      <path d={SCALLOP} fill={`url(#${gid})`} />
    </svg>
  )
}

/* ---------- Product card ---------- */

/** Eyebrow tint. Orange steps one shade deeper so 12px text stays AA on white. */
const eyebrowTone = (accent: Accent) =>
  accent === 'orange' ? accentStyles[accent].textStrong : accentStyles[accent].text

/** Card art for products that have it (newer products fall back to a tile panel). */
const artFor = productArt as Partial<Record<ProductId, string>>

interface ProductCardProps {
  product: Product
  health?: HealthResult
  /** Large horizontal card (art beside text) with an indigo ring and corner blob. */
  featured?: boolean
  className?: string
}

interface SplitUrlProps {
  url: string
  /** Host and path on separate lines (otherwise the path wraps only when needed). */
  stack?: boolean
  /** Classes for the host part, e.g. a container query that hides it when narrow. */
  hostClassName?: string
  className?: string
}

/**
 * A URL shown as a muted host plus a darker path. Breaks only between host and
 * path, never mid-word. Visual only: pair it with screen-reader text.
 */
export function SplitUrl({ url, stack = false, hostClassName, className }: SplitUrlProps) {
  const shown = displayUrl(url)
  const slash = shown.indexOf('/')
  const host = slash === -1 ? shown : shown.slice(0, slash)
  const path = slash === -1 ? '' : shown.slice(slash)
  return (
    <span aria-hidden="true" className={cn('font-mono', className)}>
      <span className={cn('text-tx-tertiary', stack && 'block', hostClassName)}>{host}</span>
      {!stack && <wbr />}
      <span className={cn(stack && 'block')}>{path}</span>
    </span>
  )
}

/**
 * Mosaic product card: art (scales 1.02 on hover), accent eyebrow, title,
 * description and link rows (console, docs, API base, live health).
 */
export function ProductCard({ product, health, featured = false, className }: ProductCardProps) {
  const p = product
  const accent = p.accent
  const status = health?.status ?? 'checking'
  const art = artFor[p.id]

  return (
    <article
      aria-labelledby={`card-${p.id}-title`}
      className={cn(
        'group/card relative isolate flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-6 xl:p-8',
        'transition-[border-color] duration-200 ease-standard',
        featured ? 'border-indigo-200 md:flex-row md:gap-8' : 'border-st-secondary hover:border-st',
        className,
      )}
    >
      {featured && <ScallopBlob className="absolute -top-8 -right-8 -z-10 size-28 rotate-12" />}

      {/* Art */}
      <div
        className={cn(
          'relative aspect-[16/10] shrink-0 overflow-hidden rounded-lg border border-st-secondary bg-sf-secondary',
          'transition-[border-color] duration-200 ease-standard group-hover/card:border-st',
          featured && 'md:aspect-auto md:w-[46%] xl:w-[52%]',
        )}
      >
        {art ? (
          <img
            src={art}
            alt=""
            width={1600}
            height={1000}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-standard group-hover/card:scale-[1.02]"
          />
        ) : (
          <div
            className={cn(
              'absolute inset-0 grid place-items-center transition-transform duration-500 ease-standard group-hover/card:scale-[1.02]',
              accentStyles[accent].gradientLight,
            )}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-noise opacity-40 mix-blend-soft-light"
            />
            <ProductTile id={p.id} size={featured ? 112 : 88} className="relative drop-shadow-sm" />
          </div>
        )}
      </div>

      {/* Copy + rows */}
      <div className={cn('@container flex min-w-0 flex-1 flex-col pt-6', featured && 'md:pt-0')}>
        <div
          className={cn('flex gap-3.5', featured ? 'flex-col items-start gap-5' : 'items-center')}
        >
          <ProductTile
            id={p.id}
            size={featured ? 52 : 44}
            className={featured ? '-m-1' : '-my-1'}
          />
          <div className="min-w-0">
            <p
              className={cn(
                'text-label font-medium tracking-eyebrow uppercase',
                eyebrowTone(p.accent),
              )}
            >
              {p.kind === 'console' ? 'Console' : 'API only'}
            </p>
            <h3
              id={`card-${p.id}-title`}
              className={cn(
                'mt-1 font-medium text-balance text-tx',
                featured
                  ? 'text-[22px] leading-[1.25] tracking-[-0.02em] xl:text-heading-3 xl:leading-[1.25]'
                  : 'text-heading-card leading-[1.3] tracking-card',
              )}
            >
              {p.name}
            </h3>
          </div>
        </div>
        <p className="mt-4 text-body-muted">{p.description}</p>

        {featured && (
          <ul className="mt-6 flex flex-col gap-3.5">
            {p.capabilities.map((cap) => (
              <li key={cap} className="flex items-start gap-3 text-body text-tx-secondary">
                <BadgeCheck
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className="mt-[3px] size-[18px] shrink-0 fill-indigo-600 text-white"
                />
                {cap}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-col pt-6">
          {p.consoleUrl && (
            <LinkRow icon={AppWindow} href={p.consoleUrl} accent={accent}>
              {p.consoleLabel ?? 'Open console'}
            </LinkRow>
          )}
          {p.docsUrl && (
            <LinkRow icon={BookOpen} href={p.docsUrl} accent={accent}>
              API docs
            </LinkRow>
          )}
          <LinkRow icon={Braces} to={`/apis#${p.id}`} accent={accent}>
            <span className="sr-only">API base URL: {displayUrl(p.apiBase)}</span>
            <SplitUrl
              url={p.apiBase}
              // Host only when host + path fit on one line in every card, so all
              // link rows keep one 50px rhythm (otherwise the path alone).
              hostClassName="hidden @min-[22.5rem]:inline"
              className="text-[13px] leading-5 tracking-normal"
            />
          </LinkRow>
          <LinkRow
            icon={Activity}
            to="/status"
            accent={accent}
            trailing={<StatusChip status={status} size="sm" />}
          >
            Health
          </LinkRow>
        </div>
      </div>
    </article>
  )
}
