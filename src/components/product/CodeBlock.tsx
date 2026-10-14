import { Check, Copy, Terminal } from 'lucide-react'
import { useId, useMemo, useRef, useState } from 'react'

import { useCopy } from '@/hooks/useCopy'
import { cn } from '@/lib/utils'

export type CodeLang = 'curl' | 'js' | 'python'

export interface CodeSnippet {
  lang: CodeLang
  code: string
}

/* ---------- Tiny tokenizer (no highlighter dependency) ---------- */

type TokenType = 'kw' | 'str' | 'fn' | 'const' | 'com' | 'punc' | 'plain'
interface Token {
  type: TokenType
  text: string
}

const tokenTone: Record<TokenType, string> = {
  kw: 'text-indigo-800', // #3333cc
  str: 'text-green-700', // #496d21
  fn: 'text-indigo-900', // #212191
  const: 'text-orange-900', // #a5460f
  com: 'text-tx-tertiary', // #666
  punc: 'text-[#4d4d4d]',
  plain: '',
}

const STRING = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/y
const PUNC = /[()[\]{}.,;:=\\]/y
const NUMBER_CONST = /\b(?:\d+(?:\.\d+)?)\b/y

const grammar: Record<CodeLang, [RegExp, TokenType][]> = {
  curl: [
    [/#.*/y, 'com'],
    [STRING, 'str'],
    [/\bcurl\b/y, 'fn'],
    [/(?<=\s)--?[A-Za-z][\w-]*/y, 'kw'],
    [/\\$/y, 'punc'],
  ],
  js: [
    [/\/\/.*/y, 'com'],
    [STRING, 'str'],
    [/\b(?:const|let|await|async|return|new|import|from|if|else)\b/y, 'kw'],
    [/\b(?:true|false|null|undefined)\b/y, 'const'],
    [NUMBER_CONST, 'const'],
    [/[A-Za-z_$][\w$]*(?=\()/y, 'fn'],
    [PUNC, 'punc'],
  ],
  python: [
    [/#.*/y, 'com'],
    [STRING, 'str'],
    [/\b(?:import|from|as|def|return|if|else|with|for|in)\b/y, 'kw'],
    [/\b(?:True|False|None)\b/y, 'const'],
    [NUMBER_CONST, 'const'],
    [/[A-Za-z_][\w]*(?=\()/y, 'fn'],
    [PUNC, 'punc'],
  ],
}

function tokenizeLine(line: string, lang: CodeLang): Token[] {
  const rules = grammar[lang]
  const out: Token[] = []
  let i = 0
  const push = (type: TokenType, text: string) => {
    const last = out[out.length - 1]
    if (last && last.type === type && type === 'plain') last.text += text
    else out.push({ type, text })
  }
  outer: while (i < line.length) {
    for (const [re, type] of rules) {
      re.lastIndex = i
      const m = re.exec(line)
      if (m && m[0].length > 0) {
        push(type, m[0])
        i += m[0].length
        continue outer
      }
    }
    push('plain', line[i])
    i++
  }
  return out
}

/* ---------- Tab glyphs ---------- */

function LangGlyph({ lang }: { lang: CodeLang }) {
  if (lang === 'curl') {
    return <Terminal aria-hidden="true" strokeWidth={1.75} className="size-3.5 text-tx-tertiary" />
  }
  if (lang === 'js') {
    return (
      <span
        aria-hidden="true"
        className="flex size-3.5 items-end justify-end rounded-[3px] bg-yellow-400 pr-px pb-px font-sans text-[6.5px] leading-none font-semibold text-tx"
      >
        JS
      </span>
    )
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5">
      <rect x="1.5" y="1.5" width="8.5" height="8.5" rx="2.5" className="fill-indigo-500" />
      <rect x="6" y="6" width="8.5" height="8.5" rx="2.5" className="fill-yellow-500" />
      <circle cx="4.4" cy="4.4" r="0.9" fill="#fff" />
      <circle cx="11.6" cy="11.6" r="0.9" fill="#fff" />
    </svg>
  )
}

const langLabel: Record<CodeLang, string> = { curl: 'cURL', js: 'JavaScript', python: 'Python' }

interface CodeBlockProps {
  snippets: readonly CodeSnippet[]
  /** Changes whenever the snippet content changes (replays the fade-in). */
  contentKey?: string
  /** What the copy toast says, e.g. "Request copied". */
  copyLabel?: string
  className?: string
  /** Extra classes on the code body (e.g. extra bottom padding under a fade). */
  bodyClassName?: string
}

/**
 * Kit code block: language tabs (2px indigo bar on the active tab), Copy at the
 * right, line-numbered code on white with the kit's token colours.
 */
export function CodeBlock({
  snippets,
  contentKey,
  copyLabel = 'Code copied',
  className,
  bodyClassName,
}: CodeBlockProps) {
  const uid = useId()
  const [active, setActive] = useState<CodeLang>(snippets[0]?.lang ?? 'curl')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const { copied, copy } = useCopy()

  const current = snippets.find((s) => s.lang === active) ?? snippets[0]
  const lines = useMemo(
    () => (current ? current.code.split('\n').map((l) => tokenizeLine(l, current.lang)) : []),
    [current],
  )

  const tabId = (lang: CodeLang) => `${uid}-tab-${lang}`
  const panelId = `${uid}-panel`

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const last = snippets.length - 1
    let next = -1
    if (e.key === 'ArrowRight') next = index === last ? 0 : index + 1
    else if (e.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    if (next < 0) return
    e.preventDefault()
    setActive(snippets[next].lang)
    tabRefs.current[next]?.focus()
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-st-secondary bg-white text-left',
        className,
      )}
    >
      <div className="flex border-b border-st-secondary bg-sf-secondary">
        <div role="tablist" aria-label="Language" className="flex">
          {snippets.map((s, i) => {
            const selected = s.lang === active
            return (
              <button
                key={s.lang}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                id={tabId(s.lang)}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(s.lang)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={cn(
                  'relative flex min-h-10 items-center gap-1.5 border-r border-st-secondary px-3 py-2.5 text-[13px] leading-5 font-medium xl:px-4',
                  'transition-colors duration-150 ease-standard focus-visible:-outline-offset-2',
                  selected ? 'bg-white text-tx' : 'text-tx-tertiary hover:text-tx-secondary',
                )}
              >
                {selected && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-[2px] bg-indigo-500"
                  />
                )}
                <LangGlyph lang={s.lang} />
                {langLabel[s.lang]}
              </button>
            )
          })}
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => current && void copy(current.code, copyLabel)}
          className="flex min-h-10 min-w-10 items-center justify-center gap-1.5 border-l border-st-secondary px-3 py-2.5 text-[13px] leading-5 text-tx-tertiary transition-colors duration-150 ease-standard hover:text-tx-secondary focus-visible:-outline-offset-2"
        >
          {copied ? (
            <Check aria-hidden="true" strokeWidth={1.75} className="size-3.5 text-green-700" />
          ) : (
            <Copy aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
          )}
          <span className="max-xl:sr-only">{copied ? 'Copied' : 'Copy'}</span>
          <span className="sr-only"> {langLabel[active]} code</span>
        </button>
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId(active)}
        tabIndex={0}
        className={cn('overflow-x-auto py-5 focus-visible:-outline-offset-2', bodyClassName)}
      >
        <pre
          key={`${contentKey ?? ''}-${active}`}
          className="w-max min-w-full animate-fade-in pr-6 font-mono text-[13px] leading-[1.8] text-tx [counter-reset:line]"
        >
          <code>
            {lines.map((tokens, li) => (
              <span
                key={li}
                className="block [counter-increment:line] before:inline-block before:w-11 before:pr-4 before:text-right before:text-tx-muted before:content-[counter(line)] before:select-none"
              >
                {tokens.map((t, ti) => (
                  <span key={ti} className={tokenTone[t.type] || undefined}>
                    {t.text}
                  </span>
                ))}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}
