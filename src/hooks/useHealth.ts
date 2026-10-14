import { useQueries } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

import {
  aggregate,
  checkService,
  historyStore,
  POLL_MS,
  recordResult,
  services,
  type HealthAggregate,
  type HealthResult,
  type ServiceId,
} from '@/lib/health'

export interface UseHealth {
  /** Latest result per service (undefined while the first check is in flight). */
  results: Record<ServiceId, HealthResult | undefined>
  aggregate: HealthAggregate
  isFetching: boolean
  refetch: () => void
}

/**
 * Shared, polled health for every service. All callers share one poll via
 * React Query (same query keys), so the header, home and /status stay in sync.
 */
export function useHealth(): UseHealth {
  return useQueries({
    queries: services.map((service) => ({
      queryKey: ['health', service.id],
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        const result = await checkService(service, signal)
        recordResult(result)
        return result
      },
      refetchInterval: POLL_MS,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: true,
      staleTime: 15_000,
      retry: false,
    })),
    combine: (queries) => {
      const results = Object.fromEntries(
        services.map((s, i) => [s.id, queries[i].data]),
      ) as Record<ServiceId, HealthResult | undefined>
      return {
        results,
        aggregate: aggregate(queries.map((q) => q.data)),
        isFetching: queries.some((q) => q.isFetching),
        refetch: () => queries.forEach((q) => void q.refetch()),
      }
    },
  })
}

/** Health for one service. */
export function useServiceHealth(id: ServiceId): HealthResult | undefined {
  return useHealth().results[id]
}

/** Session history for one service (re-renders when any new result lands). */
export function useHealthHistory(id: ServiceId): readonly HealthResult[] {
  useSyncExternalStore(historyStore.subscribe, historyStore.getVersion, historyStore.getVersion)
  return historyStore.get(id)
}
