import { useNow } from '@/hooks/useNow'
import { timeAgo } from '@/lib/format'

/** "12s ago", re-rendering on its own tick so parents stay still. */
export function Ago({ ts, className }: { ts: number | null | undefined; className?: string }) {
  const now = useNow(1000)
  return <span className={className}>{timeAgo(ts, now)}</span>
}
