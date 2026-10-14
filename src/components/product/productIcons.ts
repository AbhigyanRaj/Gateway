import { MessagesSquare, PhoneCall, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react'

import type { ProductId } from '@/data/products'

/** One icon per product, used everywhere (menus, tabs, cards, rows). */
export const productIcons: Record<ProductId, LucideIcon> = {
  studio: Sparkles,
  voice: PhoneCall,
  tcc: ShieldCheck,
  marathon: MessagesSquare,
}
