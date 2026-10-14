import { Server, type LucideIcon } from 'lucide-react'

import { ProductTile } from '@/components/product/ProductTile'
import { productById, type ProductId } from '@/data/products'
import type { ServiceId } from '@/lib/health'
import { cn } from '@/lib/utils'

const isProduct = (id: ServiceId): id is ProductId => id in productById

/** Neutral frosted tile with a glyph (the server has no product art). */
function GlyphTile({
  icon: Icon,
  size,
  tone,
  className,
}: {
  icon: LucideIcon
  size: number
  tone: string
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={cn('grid shrink-0 place-items-center', className)}
    >
      <span
        className="grid place-items-center rounded-[24%] bg-[linear-gradient(160deg,#ffffff_0%,#f3f3f5_55%,#e6e7ec_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9),inset_0_-2px_3px_rgba(30,32,51,0.06),0_1px_2px_rgba(30,32,51,0.08),0_6px_16px_-8px_rgba(30,32,51,0.25)]"
        style={{ width: size * 0.78, height: size * 0.78 }}
      >
        <Icon
          strokeWidth={1.5}
          className={tone}
          style={{ width: size * 0.36, height: size * 0.36 }}
        />
      </span>
    </span>
  )
}

/**
 * The glossy product tile for a service; the shared gateway server (no
 * product art) gets a neutral frosted tile with a glyph instead. Always
 * decorative: the service name is rendered next to it.
 */
export function ServiceTile({
  id,
  size,
  className,
}: {
  id: ServiceId
  size: number
  className?: string
}) {
  if (!isProduct(id))
    return <GlyphTile icon={Server} size={size} tone="text-tx-tertiary" className={className} />
  return <ProductTile id={id} size={size} className={className} />
}
