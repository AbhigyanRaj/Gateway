import type { ReactNode } from 'react'

import { POLL_MS, type HealthAggregate } from '@/lib/health'
import { cn } from '@/lib/utils'

function Metric({ value, unit, label }: { value: ReactNode; unit?: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center md:gap-2">
      <p className="flex items-baseline justify-center gap-1 py-1 font-display text-[34px] leading-none font-hero tracking-[-0.02em] text-white tabular min-[375px]:text-[40px] sm:gap-1.5 sm:text-[56px] md:py-5 md:text-8xl">
        {value}
        {unit && (
          <span className="text-[16px] text-white/80 sm:text-[24px] md:text-[40px]">{unit}</span>
        )}
      </p>
      <p className="max-w-[16rem] text-[13px] leading-snug text-pretty text-white/90 sm:text-body md:text-[20px] md:leading-normal">
        {label}
      </p>
    </div>
  )
}

/**
 * The page's single dark band (kit api-tts metric band): full bleed, a blurred
 * vertical indigo gradient that blooms out of the page and back.
 */
export function MetricBand({
  aggregate,
  className,
}: {
  aggregate: HealthAggregate
  className?: string
}) {
  const ready = aggregate.status !== 'checking'
  const median = aggregate.medianLatencyMs
  const seconds = median !== null && median >= 1000
  return (
    <section
      aria-label="Service metrics"
      className={cn(
        'relative overflow-x-clip py-20 md:-my-12 md:min-h-[350px] md:py-20',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 scale-x-200 bg-(image:--gradient-metric-band) blur-3xl"
      />
      <div className="relative container-page grid grid-cols-3 items-start gap-3 sm:gap-6 md:gap-8">
        <Metric
          value={ready ? `${aggregate.up}/${aggregate.total}` : '…'}
          label="services operational"
        />
        <Metric
          value={median === null ? '…' : seconds ? (median / 1000).toFixed(1) : median}
          unit={median === null ? undefined : seconds ? 's' : 'ms'}
          label="median response time"
        />
        <Metric value={POLL_MS / 1000} unit="s" label="check interval" />
      </div>
    </section>
  )
}
