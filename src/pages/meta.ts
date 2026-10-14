import { products } from '@/data/products'

/** "a, b and c" */
export const listNames = (names: readonly string[]) =>
  names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`

/** Every product name in display order, as a sentence fragment. */
export const productNames = listNames(products.map((p) => p.name))
