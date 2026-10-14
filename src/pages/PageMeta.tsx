import { SITE_ORIGIN } from '@/config/site'

interface PageMetaProps {
  title: string
  description: string
  /** Route path for the canonical URL and og:url, e.g. "/apis". Omit on noindex pages. */
  path?: string
  noindex?: boolean
}

/**
 * Per-route document metadata, rendered with React 19's native hoisting into
 * <head>. index.html carries static defaults for crawlers that don't run JS;
 * main.tsx removes those before the first render so tags are never doubled.
 */
export function PageMeta({ title, description, path, noindex = false }: PageMetaProps) {
  const url = path === undefined ? undefined : new URL(path, SITE_ORIGIN).toString()
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex" />}
      {url && <link rel="canonical" href={url} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {url && <meta property="og:url" content={url} />}
    </>
  )
}
