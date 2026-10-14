import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'

import { PageHero } from '@/components/primitives/PageHero'
import { ProductTile } from '@/components/product/ProductTile'
import { Button } from '@/components/ui/button'
import { site } from '@/config/site'
import { products } from '@/data/products'

const rowClass =
  'group flex min-h-[52px] items-center justify-between gap-4 border-b border-st py-2.5 text-body leading-[1.55] tracking-[-0.14px] text-tx-secondary transition-colors duration-200 ease-standard last:border-b-0 hover:text-tx'

const arrowClass =
  'size-[18px] shrink-0 text-st transition-[color,translate] duration-200 ease-standard group-hover:translate-x-0.5 group-hover:text-tx-tertiary'

export default function NotFoundPage() {
  return (
    <>
      <title>{`Page not found · ${site.name}`}</title>
      <meta name="robots" content="noindex" />

      <PageHero
        title="Page not found"
        subtitle="That address doesn't lead anywhere. Try one of these instead."
        className="pb-4"
      >
        <nav aria-label="Main pages" className="mt-8 flex flex-wrap justify-center gap-3 md:mt-10">
          <Button asChild variant="soft" size="md">
            <Link to="/">Home</Link>
          </Button>
          <Button asChild variant="soft" size="md">
            <Link to="/apis">APIs</Link>
          </Button>
          <Button asChild variant="soft" size="md">
            <Link to="/status">Status</Link>
          </Button>
        </nav>

        <nav
          aria-labelledby="nf-products"
          className="mt-14 flex w-full max-w-[420px] flex-col rounded-2xl border border-st-secondary bg-white px-6 pt-5 pb-2 text-left md:mt-20"
        >
          <h2 id="nf-products" className="pb-2 label-mono text-tx-tertiary">
            Products
          </h2>
          {products.map((p) =>
            p.consoleUrl ? (
              <a
                key={p.id}
                href={p.consoleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={rowClass}
              >
                <span className="inline-flex items-center gap-3">
                  <ProductTile id={p.id} size={28} />
                  {p.name}
                  <span className="sr-only"> (opens in a new tab)</span>
                </span>
                <ArrowUpRight aria-hidden="true" strokeWidth={1.5} className={arrowClass} />
              </a>
            ) : (
              <Link key={p.id} to={`/apis#${p.id}`} className={rowClass}>
                <span className="inline-flex items-center gap-3">
                  <ProductTile id={p.id} size={28} />
                  {p.name}
                  <span className="text-caption text-tx-tertiary">API</span>
                </span>
                <ArrowRight aria-hidden="true" strokeWidth={1.5} className={arrowClass} />
              </Link>
            ),
          )}
        </nav>
      </PageHero>
    </>
  )
}
