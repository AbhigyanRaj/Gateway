import { Search, X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'

import { cn } from '@/lib/utils'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  label: string
  placeholder: string
  className?: string
}

const isTyping = (el: Element | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))

/** Kit search input: 48px, 16px radius, indigo focus ring. "/" focuses it, Esc clears it. */
export function SearchField({ value, onChange, label, placeholder, className }: SearchFieldProps) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || isTyping(document.activeElement))
        return
      e.preventDefault()
      input.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className={cn('relative w-full', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        aria-hidden="true"
        strokeWidth={1.5}
        className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-tx-tertiary"
      />
      <input
        ref={input}
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && value) {
            e.preventDefault()
            onChange('')
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className={cn(
          'min-h-12 w-full appearance-none rounded-2xl border border-st-secondary bg-white py-2.5 pr-12 pl-10 text-caption text-tx',
          'transition-[border-color,box-shadow] duration-200 ease-standard placeholder:text-tx-tertiary',
          'hover:border-st focus:border-indigo-800 focus:ring-2 focus:ring-indigo-800/20 focus-visible:outline-none',
          '[&::-webkit-search-cancel-button]:appearance-none',
        )}
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            onChange('')
            input.current?.focus()
          }}
          className="absolute top-1/2 right-1 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-tx-tertiary transition-colors duration-200 hover:bg-sf-secondary hover:text-tx"
        >
          <X aria-hidden="true" strokeWidth={1.5} className="size-4" />
        </button>
      ) : (
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3.5 hidden size-5 -translate-y-1/2 items-center justify-center rounded-[5px] border border-st font-mono text-label text-tx-tertiary md:inline-flex"
        >
          /
        </kbd>
      )}
    </div>
  )
}
