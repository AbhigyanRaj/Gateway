import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge must know the kit's custom font-size names; otherwise it
 * treats e.g. `text-body` as a colour and drops `text-white`.
 */
const twMerge = extendTailwindMerge<'kit-copy'>({
  extend: {
    classGroups: {
      'font-family': [{ font: ['display', 'sans', 'mono'] }],
      'font-weight': [{ font: ['regular', 'medium', 'semibold', 'hero', 'display-medium'] }],
      'font-size': [
        {
          text: [
            '2xs',
            'label',
            'caption',
            'nav',
            'body',
            'body-lg',
            'heading-card',
            'heading-4',
            'heading-3',
            'heading-feature',
            'heading-sub',
            'heading-section',
            'heading-2',
            'heading-page',
            'hero-sm',
            'hero',
            'metric',
          ],
        },
      ],
      // Composite kit utilities (size + line-height + colour) live in their own group.
      'kit-copy': ['text-lead', 'text-intro', 'text-body-muted'],
      shadow: [
        {
          shadow: [
            'kit-sm',
            'kit-md',
            'kit-lg',
            'card',
            'card-hover',
            'stroke-sm',
            'stroke-md',
            'btn-ink',
            'btn-soft',
            'btn-outline',
            'tab-active',
            'focus',
            'focus-error',
            'inset-glow-white',
            'inset-glow-indigo',
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
