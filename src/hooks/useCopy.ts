import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

/** Copy text to the clipboard with a toast; `copied` flips true for 1.6s. */
export function useCopy() {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = useCallback(async (text: string, label = 'Copied to clipboard') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(label)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error('Could not copy — select the text and copy manually')
    }
  }, [])

  return { copied, copy }
}
