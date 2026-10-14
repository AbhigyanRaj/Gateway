import { RotateCw } from 'lucide-react'
import { Link } from 'react-router'

import { PageHero } from '@/components/primitives/PageHero'
import { Button } from '@/components/ui/button'
import { site } from '@/config/site'

import { PageMeta } from './PageMeta'

/** Shown inside the site chrome when a page fails to render or its code fails to load. */
export default function RouteErrorPage() {
  return (
    <>
      <PageMeta
        title={`Something went wrong · ${site.name}`}
        description="This page didn't load."
        noindex
      />
      <PageHero
        title="Something went wrong"
        subtitle="This page didn't load. Reloading usually fixes it."
        className="pb-4"
      >
        <div className="mt-8 flex flex-wrap justify-center gap-3 md:mt-10">
          <Button variant="soft" size="md" onClick={() => window.location.reload()}>
            <RotateCw aria-hidden="true" strokeWidth={1.75} />
            Reload
          </Button>
          <Button asChild variant="ghost" size="md">
            <Link to="/">Home</Link>
          </Button>
        </div>
      </PageHero>
    </>
  )
}
