import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router'

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Opens an accordion row and brings it into view. Also handles deep links:
 * on load (or when the hash changes) `#voice` opens and scrolls to that row.
 *
 * `open(id)` must add the id to the open set (and clear filters that hide it).
 */
export function useRowFocus(isRow: (id: string) => boolean, open: (id: string) => void) {
  const { hash } = useLocation()
  const latest = useRef({ isRow, open })
  useLayoutEffect(() => {
    latest.current = { isRow, open }
  })

  const focusRow = useCallback(
    (
      id: string,
      { moveFocus = false, smooth = true }: { moveFocus?: boolean; smooth?: boolean } = {},
    ) => {
      if (!latest.current.isRow(id)) return
      latest.current.open(id)
      if (window.location.hash !== `#${id}`) {
        window.history.replaceState(window.history.state, '', `#${id}`)
      }
      // Wait for the open state to render before measuring.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const row = document.getElementById(id)
          if (!row) return
          row.scrollIntoView({
            block: 'start',
            behavior: smooth && !prefersReduced() ? 'smooth' : 'auto',
          })
          if (moveFocus) document.getElementById(`${id}-trigger`)?.focus({ preventScroll: true })
        }),
      )
    },
    [],
  )

  useEffect(() => {
    const id = decodeURIComponent(hash.slice(1))
    if (id) focusRow(id, { smooth: false })
  }, [hash, focusRow])

  return focusRow
}
