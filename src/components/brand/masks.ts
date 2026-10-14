import {
  EMBLEM_DIAMOND,
  EMBLEM_PETALS_PATH,
  EMBLEM_STROKE,
  WORDMARK_HEIGHT,
  WORDMARK_PATH,
  WORDMARK_WIDTH,
} from './paths'

/** Wrap an SVG string as a CSS `url()` value, usable for `mask-image` or `background-image`. */
const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

const NS = "xmlns='http://www.w3.org/2000/svg'"

/** Outlined wordmark as a standalone SVG document (black fill). */
export const wordmarkSvg = `<svg ${NS} viewBox='0 0 ${WORDMARK_WIDTH} ${WORDMARK_HEIGHT}'><path d='${WORDMARK_PATH}'/></svg>`

/** Outlined wordmark as a CSS url(), e.g. `maskImage: wordmarkMask`. */
export const wordmarkMask = svgUrl(wordmarkSvg)

/** Width / height of the outlined wordmark, for `aspect-ratio`. */
export const wordmarkAspect = `${WORDMARK_WIDTH} / ${WORDMARK_HEIGHT}`

/** Solid emblem (filled petals + diamond) as a standalone SVG document. */
export const emblemSolidSvg = `<svg ${NS} viewBox='0 0 48 48'><path d='${EMBLEM_PETALS_PATH}' stroke='#000' stroke-width='${EMBLEM_STROKE}' stroke-linejoin='round'/><path d='${EMBLEM_DIAMOND}'/></svg>`

/** Solid emblem as a CSS url(), for masks (mobile giant footer, large glyphs). */
export const emblemMask = svgUrl(emblemSolidSvg)

/** Outline emblem as a standalone SVG document. */
export const emblemOutlineSvg = `<svg ${NS} viewBox='0 0 48 48'><path d='${EMBLEM_PETALS_PATH}' fill='none' stroke='#000' stroke-width='${EMBLEM_STROKE}' stroke-linejoin='round'/><path d='${EMBLEM_DIAMOND}'/></svg>`

/** Outline emblem as a CSS url(). */
export const emblemOutlineMask = svgUrl(emblemOutlineSvg)
