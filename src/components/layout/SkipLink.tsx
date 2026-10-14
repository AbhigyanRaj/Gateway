/** First focusable element: jumps keyboard users past the header to <main id="main">. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="fixed top-3 left-3 z-[10001] inline-flex min-h-10 -translate-y-20 items-center rounded-full bg-white px-5 text-nav font-medium text-tx shadow-kit-md ring-1 ring-st-secondary transition-transform duration-200 ease-standard focus:translate-y-0 focus-visible:translate-y-0"
    >
      Skip to content
    </a>
  )
}
