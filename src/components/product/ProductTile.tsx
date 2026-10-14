import * as art from '@/assets/art'
import { accentStyles, productById, type ProductId } from '@/data/products'
import { cn } from '@/lib/utils'

interface ProductTileProps {
  id: ProductId
  /** Rendered size in px (square). Default 44. */
  size?: number
  className?: string
  /** Set when the tile is the only label for the product (otherwise decorative). */
  labelled?: boolean
}

type TileSet = Partial<Record<ProductId, string>>

/** Pick the smallest tile export that is still crisp at 2x for this size. */
function tileSrc(id: ProductId, size: number): string | undefined {
  const sets = art as unknown as Record<string, TileSet | undefined>
  const order =
    size <= 48
      ? ['tileArtXs', 'tileArtSm', 'tileArt']
      : size <= 80
        ? ['tileArtSm', 'tileArt']
        : ['tileArt', 'tileArtSm']
  for (const key of order) {
    const src = sets[key]?.[id]
    if (src) return src
  }
  return undefined
}

/**
 * The product's glossy 3D icon tile. Use this everywhere a product is
 * represented by an icon (menus, tabs, cards, API and status rows, marquee).
 * Falls back to an accent-gradient tile if the artwork is not available.
 */
export function ProductTile({ id, size = 44, className, labelled = false }: ProductTileProps) {
  const product = productById[id]
  const src = tileSrc(id, size)
  const a11y = labelled
    ? { role: 'img' as const, 'aria-label': product.name }
    : { 'aria-hidden': true as const }

  if (!src) {
    return (
      <span
        {...a11y}
        className={cn(
          'inline-block shrink-0 rounded-[24%] shadow-inset-glow-white',
          accentStyles[product.accent].gradient,
          className,
        )}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={labelled ? product.name : ''}
      aria-hidden={labelled ? undefined : true}
      decoding="async"
      draggable={false}
      className={cn('shrink-0 select-none', className)}
      style={{ width: size, height: size }}
    />
  )
}
