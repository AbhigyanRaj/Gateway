import {
  AudioLines,
  FileCheck2,
  BotMessageSquare,
  Magnet,
  Newspaper,
  ScanEye,
  SquareKanban,
  WandSparkles,
  type LucideIcon,
} from 'lucide-react'

import type { ProductId } from '@/data/products'

/**
 * Small line icons for tight inline spots only. For product identity
 * (menus, tabs, cards, rows) use <ProductTile id /> instead.
 */
export const productIcons: Record<ProductId, LucideIcon> = {
  studio: WandSparkles,
  voice: AudioLines,
  minicrm: SquareKanban,
  leadhub: Magnet,
  tcc: ScanEye,
  marathon: BotMessageSquare,
  editorialcrm: Newspaper,
  editorialgate: FileCheck2,
}
