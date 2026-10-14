import type { ProductId } from '@/data/products'

/** DOM ids linking each showcase tab to its panel. */
export const tabId = (id: ProductId) => `showcase-tab-${id}`
export const panelId = (id: ProductId) => `showcase-panel-${id}`
