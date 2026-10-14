import { Link } from 'react-router'

import { ProductTile } from '@/components/product/ProductTile'
import { products, type Product } from '@/data/products'
import { cn } from '@/lib/utils'

interface Slot {
  /** lg+: offset from the copy centre. x in % of the container width, y in px. */
  x: number
  y: number
  /** md: offset (only the four corner slots show on tablets). */
  md?: { x: number; y: number }
  size: number
  rotate: number
  /** Farther tiles: smaller, slightly faded and softened. */
  far?: boolean
  float: 1 | 2
  delay: number
}

/**
 * A downward-opening arc framing the copy, in product order:
 * upper-left, upper-right, left, right, lower-left, lower-right.
 */
const slots: readonly Slot[] = [
  { x: -32, y: -206, md: { x: -50, y: -118 }, size: 64, rotate: -6, float: 1, delay: -0.8 },
  { x: 32, y: -214, md: { x: 50, y: -104 }, size: 60, rotate: 5, float: 2, delay: -2.6 },
  { x: -41, y: -36, size: 72, rotate: 4, float: 2, delay: -4.1 },
  { x: 41, y: -24, size: 68, rotate: -5, float: 1, delay: -1.9 },
  { x: -46, y: 150, md: { x: -48, y: 126 }, size: 56, rotate: -3, far: true, float: 1, delay: -3.3 },
  { x: 46, y: 162, md: { x: 48, y: 140 }, size: 58, rotate: 6, far: true, float: 2, delay: -5.2 },
]

function tileLink(product: Product) {
  return product.consoleUrl
    ? { href: product.consoleUrl, label: `Open ${product.name} (opens in a new tab)` }
    : { to: `/apis#${product.id}`, label: `${product.name} API` }
}

/** One floating, linked product tile with a hover lift and a name label. */
export function OrbitTile({
  product,
  size,
  rotate,
  far = false,
  labelBelow = true,
  className: extra,
}: {
  product: Product
  size: number
  rotate: number
  far?: boolean
  labelBelow?: boolean
  className?: string
}) {
  const link = tileLink(product)
  const className = cn('group/tile relative block rounded-[24%] outline-offset-4', extra)
  const content = (
    <>
      <span
        className={cn(
          'block transition-[translate,scale,filter,opacity] duration-300 ease-standard',
          'drop-shadow-[0_10px_16px_rgb(30_32_51/0.12)] group-hover/tile:-translate-y-1 group-hover/tile:scale-[1.06] group-hover/tile:drop-shadow-[0_18px_26px_rgb(30_32_51/0.2)]',
          'group-focus-visible/tile:-translate-y-1 group-focus-visible/tile:scale-[1.06]',
          far && 'opacity-90 blur-[0.5px] group-hover/tile:opacity-100 group-hover/tile:blur-none',
        )}
      >
        <ProductTile id={product.id} size={size} />
      </span>
      {labelBelow && (
        <span
          aria-hidden="true"
          style={{ rotate: `${-rotate}deg` }}
          className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 translate-y-1 rounded-full bg-white/85 px-2.5 py-1 text-[12px] leading-4 font-medium whitespace-nowrap text-tx-secondary opacity-0 shadow-kit-sm ring-1 ring-st backdrop-blur-sm transition-[opacity,translate] duration-200 ease-standard group-hover/tile:translate-y-0 group-hover/tile:opacity-100 group-focus-visible/tile:translate-y-0 group-focus-visible/tile:opacity-100"
        >
          {product.shortName}
        </span>
      )}
    </>
  )
  const style = { rotate: `${rotate}deg` }
  return 'href' in link ? (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={link.label}
      className={className}
      style={style}
    >
      {content}
    </a>
  ) : (
    <Link to={link.to} aria-label={link.label} className={className} style={style}>
      {content}
    </Link>
  )
}

/**
 * md+: the six product tiles float in an arc around the headline block.
 * Positioned against the copy stage (container width x copy height), so it
 * never collides with the text. Tablets show the four corner tiles only.
 */
export function HeroOrbit() {
  return (
    <ul
      aria-label="ET AI products"
      // Short screens: pull the arc in vertically and shrink the tiles a little.
      className="pointer-events-none absolute inset-0 hidden md:block [@media(min-height:741px)_and_(max-height:820px)]:[--k:0.92] [@media(max-height:740px)]:[--k:0.84] [@media(max-height:740px)]:[&_li]:scale-90"
    >
      {products.slice(0, slots.length).map((p, i) => {
        const s = slots[i]
        return (
          <li
            key={p.id}
            className={cn(
              'pointer-events-auto absolute w-max top-[calc(50%+var(--md-y)*var(--k,1))] left-[calc(50%+var(--md-x))] -translate-x-1/2 -translate-y-1/2',
              'lg:top-[calc(50%+var(--y)*var(--k,1))] lg:left-[calc(50%+var(--x))]',
              s.md ? 'scale-[.84] lg:scale-100' : 'hidden lg:block',
            )}
            style={
              {
                '--x': `${s.x}%`,
                '--y': `${s.y}px`,
                '--md-x': `${s.md?.x ?? s.x}%`,
                '--md-y': `${s.md?.y ?? s.y}px`,
              } as React.CSSProperties
            }
          >
            <div
              className={s.float === 1 ? 'animate-float' : 'animate-float-2'}
              style={{ animationDelay: `${s.delay}s` }}
            >
              <OrbitTile product={p} size={s.size} rotate={s.rotate} far={s.far} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/** Below md: one calm row of the six tiles, lifted into a gentle arc. */
export function HeroTileRow({ className }: { className?: string }) {
  const n = products.length
  return (
    <ul
      aria-label="ET AI products"
      className={cn('flex items-start justify-center gap-0.5 min-[360px]:gap-1.5 md:hidden', className)}
    >
      {products.map((p, i) => {
        const t = n > 1 ? (i / (n - 1)) * 2 - 1 : 0 // -1 … 1
        return (
          <li key={p.id} style={{ translate: `0 ${Math.round(t * t * 8)}px` }}>
            <OrbitTile
              product={p}
              size={36}
              rotate={Math.round(t * 8)}
              labelBelow={false}
              className="grid size-11 place-items-center outline-offset-0"
            />
          </li>
        )
      })}
    </ul>
  )
}
