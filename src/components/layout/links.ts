import { productById, products, serverHealth, type Product } from '@/data/products'

/** Where a product's menu entry goes: its console, or the API directory for API-only products. */
export const productHref = (p: Product) => p.consoleUrl ?? `/apis#${p.id}`

export const studioUrl = productById.studio.consoleUrl ?? '/apis#studio'

export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  title: string
  links: FooterLink[]
}

const tccDocs = productById.tcc.docsUrl ?? '/apis#tcc'

export const footerColumns: FooterColumn[] = [
  {
    title: 'Products',
    links: products.map((p) => ({ label: p.name, href: productHref(p) })),
  },
  {
    title: 'APIs',
    links: [
      { label: 'API directory', href: '/apis' },
      { label: 'Calling Bot API', href: '/apis#voice' },
      { label: 'MiniCRM API', href: '/apis#minicrm' },
      { label: 'TCC API docs', href: tccDocs },
      { label: 'Marathon API', href: '/apis#marathon' },
    ],
  },
  {
    title: 'Status',
    links: [
      { label: 'Live status', href: '/status' },
      { label: 'Server health', href: serverHealth.url },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'TCC API docs', href: tccDocs },
      { label: 'AI Studio sign-in', href: studioUrl },
    ],
  },
]
