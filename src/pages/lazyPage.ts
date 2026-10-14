import { lazy, type ComponentType } from 'react'

const RELOAD_KEY = 'gateway:chunk-reload'

function storage(): Storage | undefined {
  try {
    return window.sessionStorage
  } catch {
    return undefined
  }
}

/**
 * React.lazy for code-split pages and sections. When a chunk fails to load
 * (usually because a deploy replaced the hashed files under an open tab), the
 * page reloads once to pick up the new build. A second failure is rethrown
 * for the route error page to show.
 */
export function lazyPage<T extends ComponentType>(load: () => Promise<{ default: T }>) {
  return lazy(() =>
    load().then(
      (mod) => {
        storage()?.removeItem(RELOAD_KEY)
        return mod
      },
      (error: unknown) => {
        const store = storage()
        if (!store || store.getItem(RELOAD_KEY)) throw error
        store.setItem(RELOAD_KEY, '1')
        window.location.reload()
        return new Promise<never>(() => {})
      },
    ),
  )
}
