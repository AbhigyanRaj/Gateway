import { ProductTile } from '@/components/product/ProductTile'
import type { Product } from '@/data/products'
import { cn } from '@/lib/utils'

import { productHref } from './links'
import { SmartLink } from './SmartLink'

/** Tiny neutral pill for API-only products. */
export function ApiOnlyPill({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-[18px] items-center rounded-full border border-st-secondary bg-sf-secondary px-1.5 text-[11px] leading-none font-medium tracking-[0.01em] text-tx-tertiary',
        className,
      )}
    >
      API only
    </span>
  )
}

/**
 * A product entry for the mega menu and mobile drawer: glossy tile, name,
 * one-line tagline. Links to the product console (new tab), or to the API
 * directory for API-only products.
 */
export function ProductMenuItem({
  product,
  className,
  ...props
}: Omit<React.ComponentProps<'a'>, 'href' | 'children'> & { product: Product }) {
  return (
    <SmartLink
      {...props}
      href={productHref(product)}
      className={cn(
        'group flex items-center gap-4 rounded-xl p-1 transition-colors duration-150 ease-standard hover:bg-sf-secondary',
        className,
      )}
    >
      <ProductTile id={product.id} size={44} />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-2 text-body leading-[1.3] font-medium text-tx-secondary transition-colors duration-150 group-hover:text-tx">
          <span className="truncate">{product.name}</span>
          {product.kind === 'api' && <ApiOnlyPill />}
        </span>
        <span className="text-[13px] leading-[1.3] text-balance text-tx-tertiary">
          {product.tagline}
        </span>
      </span>
    </SmartLink>
  )
}
