import { BadgeCheck, Braces } from 'lucide-react'
import { Link } from 'react-router'

import { productArt, showcaseStudio } from '@/assets/art'
import { ProductTile } from '@/components/product/ProductTile'
import { Button } from '@/components/ui/button'
import { accentStyles, type Product, type ProductId } from '@/data/products'

import { ShowcaseStatus } from './ShowcaseStatus'

const apiPath = (url: string) => new URL(url).pathname

function NewTabHint() {
  return <span className="sr-only"> (opens in a new tab)</span>
}

/**
 * Primary + secondary actions for one product. Calm by design: the primary is
 * a white hairline pill (ink is reserved for page-level CTAs) and the
 * secondary a ghost pill.
 */
function PanelActions({ product }: { product: Product }) {
  const { id, kind, consoleUrl, consoleLabel, docsUrl } = product
  // Below 360px the pair stacks full width (as the hero buttons do).
  const primary =
    'shadow-btn-outline hover:bg-white hover:shadow-[inset_0_0_0_1px_rgb(30_32_51/0.26)] max-[359px]:w-full'
  const secondary = 'max-[359px]:w-full'
  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
      {kind === 'console' && consoleUrl ? (
        <Button variant="outline" size="md" arrow asChild className={primary}>
          <a href={consoleUrl} target="_blank" rel="noopener noreferrer">
            {consoleLabel ?? 'Open console'}
            <NewTabHint />
          </a>
        </Button>
      ) : (
        <Button variant="outline" size="md" arrow asChild className={primary}>
          <Link to={`/apis#${id}`}>View API</Link>
        </Button>
      )}
      {docsUrl ? (
        <Button variant="ghost" size="md" asChild className={secondary}>
          <a href={docsUrl} target="_blank" rel="noopener noreferrer">
            API docs
            <NewTabHint />
          </a>
        </Button>
      ) : kind === 'console' ? (
        <Button variant="ghost" size="md" asChild className={secondary}>
          <Link to={`/apis#${id}`}>API details</Link>
        </Button>
      ) : (
        <Button variant="ghost" size="md" asChild className={secondary}>
          <Link to="/status">Service status</Link>
        </Button>
      )}
    </div>
  )
}

/** Product art in an 8px translucent glass mat, with a calm API-path chip. */
/** Panel art for products that have it; newer products get an accent panel with their tile. */
const panelArt = productArt as Partial<Record<ProductId, string>>

function PanelMedia({ product }: { product: Product }) {
  const isStudio = product.id === 'studio'
  const src = isStudio ? showcaseStudio : panelArt[product.id]
  return (
    <div className="relative rounded-2xl bg-white/50 p-1.5 shadow-card ring-1 ring-white/60 md:p-2">
      {src ? (
        <img
          src={src}
          alt=""
          width={isStudio ? 1920 : 1600}
          height={isStudio ? 1080 : 1000}
          loading="lazy"
          decoding="async"
          className="aspect-[16/10] w-full rounded-xl bg-sf-secondary object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className={`flex aspect-[16/10] w-full items-center justify-center rounded-xl ${accentStyles[product.accent].gradientLight}`}
        >
          <ProductTile id={product.id} size={120} />
        </div>
      )}
      <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 font-mono text-[12px] leading-4 text-tx-secondary shadow-kit-sm ring-1 ring-white/80 backdrop-blur-md md:bottom-6 md:left-6">
        <Braces aria-hidden="true" strokeWidth={1.5} className="size-3.5 text-tx-tertiary" />
        {apiPath(product.apiBase)}
      </span>
    </div>
  )
}

/** One product's showcase content: copy + checklist + live status + actions | art. */
export function ShowcasePanel({ product }: { product: Product }) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:gap-16">
      <div className="flex flex-col items-start text-left max-lg:order-2">
        <div className="flex items-center gap-3">
          <ProductTile id={product.id} size={44} className="-my-1" />
          <p className="eyebrow">{product.kind === 'console' ? 'Console' : 'API only'}</p>
        </div>

        <h3 className="mt-4 font-display text-[30px] leading-[1.15] font-display-medium tracking-[-0.02em] text-balance text-tx md:mt-5 md:text-[34px] xl:text-[36px]">
          {product.name}
        </h3>
        <p className="mt-3 max-w-[30rem] text-body text-pretty text-tx-tertiary md:mt-4 md:text-body-lg">
          {product.description}
        </p>

        <ul className="mt-6 flex flex-col gap-3.5 md:mt-7">
          {product.capabilities.map((cap) => (
            <li key={cap} className="flex items-start gap-3 text-body text-tx-secondary">
              <BadgeCheck
                aria-hidden="true"
                strokeWidth={1.5}
                className="mt-[3px] size-[18px] shrink-0 text-indigo-600"
              />
              {cap}
            </li>
          ))}
        </ul>

        <div className="mt-6 md:mt-7">
          <ShowcaseStatus id={product.id} />
        </div>

        <div className="mt-7 md:mt-8">
          <PanelActions product={product} />
        </div>
      </div>

      <div className="max-lg:order-1">
        <PanelMedia product={product} />
      </div>
    </div>
  )
}
