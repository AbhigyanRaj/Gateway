import { useEffect, useRef, useState } from 'react'

import { footerTexture } from '@/assets/art'
import { emblemMask, wordmarkAspect, wordmarkMask } from '@/components/brand/masks'
import { cn } from '@/lib/utils'

const maskStyle = (mask: string): React.CSSProperties => ({
  maskImage: mask,
  WebkitMaskImage: mask,
  maskSize: 'contain',
  WebkitMaskSize: 'contain',
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
  maskPosition: 'center',
  WebkitMaskPosition: 'center',
})

/** Load the texture only when the footer approaches the viewport. */
function useNearViewport<T extends HTMLElement>(margin = '600px') {
  const ref = useRef<T>(null)
  const [near, setNear] = useState(() => typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    const el = ref.current
    if (!el || near) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: margin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [margin, near])
  return [ref, near] as const
}

/**
 * The giant footer mark: the outlined wordmark (md+) or the solid emblem
 * (mobile) used as a CSS mask over the footer texture. The footer clips its
 * lower part so only the top ~58% of the letters shows. Decorative.
 */
export function GiantWordmark({ className }: { className?: string }) {
  const [ref, near] = useNearViewport<HTMLDivElement>()
  // Warm terracotta wash multiplied over the newsprint so the letters read as
  // rich printed type on the pale footer; richest at the top (the part that shows).
  const wash =
    'linear-gradient(180deg, rgb(150 60 16 / 0.6) 0%, rgb(190 82 30 / 0.48) 45%, rgb(222 104 50 / 0.36) 100%)'
  const fill: React.CSSProperties = {
    backgroundColor: 'var(--color-orange-400)',
    backgroundImage: near ? `${wash}, url(${footerTexture})` : wash,
    backgroundBlendMode: 'multiply, normal',
    backgroundSize: '100% 100%, cover',
    backgroundPosition: 'center',
    filter: 'saturate(1.05) contrast(1.12) brightness(0.96)',
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn('pointer-events-none flex w-full justify-center select-none', className)}
    >
      {/* md+: the wordmark, cut by the footer edge at ~58% of cap height. */}
      <div
        className="hidden w-[92%] max-w-[1480px] min-[1609px]:mb-[-104px] md:mb-[-6.4%] md:block"
        style={{ ...maskStyle(wordmarkMask), ...fill, aspectRatio: wordmarkAspect }}
      />
      {/* Mobile: the solid emblem, pushed a third below the fold. */}
      <div
        className="-mt-24 aspect-square w-[96%] max-w-[440px] translate-y-1/3 md:hidden"
        style={{ ...maskStyle(emblemMask), ...fill }}
      />
    </div>
  )
}
