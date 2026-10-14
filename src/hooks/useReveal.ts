import { useEffect, useRef } from 'react'

/**
 * Scroll reveal (md+): attach the ref to an element with `data-reveal`
 * (or `data-reveal-stagger`; give children `style={{ '--i': index }}`).
 * Adds `.is-revealed` once the element enters the viewport. CSS lives in styles/index.css.
 */
export function useReveal<T extends HTMLElement = HTMLElement>(threshold = 0) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-revealed')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-revealed')
            io.unobserve(e.target)
          }
        }
      },
      // Reveal as soon as the section's top edge is ~8% into the viewport, so
      // tall sections never leave an empty band while waiting for a ratio.
      { threshold, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return ref
}
