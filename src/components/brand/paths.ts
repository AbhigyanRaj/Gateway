/**
 * Raw geometry for the ET AI Labs marks. Plain data with no imports, so the
 * favicon script (scripts/make-favicons.mjs) can read it as well as the app.
 */

/* ---------- Wordmark (outlined) ---------- */

/**
 * "ET AI Labs" set in Figtree Bold (wght 700), tracking -0.035em, converted to
 * outlines with HarfBuzz shaping (kerning applied). Units: 1 = 1/100 em, so
 * the wordmark is 437.3 x 71.2 with the cap line at y=0 and baseline at y=70.
 * Use it wherever the web font is unavailable: CSS masks, favicons, OG art.
 */
export const WORDMARK_PATH =
  'M0 70V0H44.3V12.5H13.7V28.4H40.1V40.6H13.7V57.5H44.7V70ZM70.2 70V12.5H49.2V0H104.8V12.5H83.9V70ZM123.8 70 151.4 0H166L193.6 70H179.1L173.1 54.6H144.3L138.3 70ZM148.8 42.5H168.6L158.7 17.1ZM198.5 70V0H212.2V70ZM244.2 70V0H257.9V57.5H288.7V70ZM308.7 71.2Q299.7 71.2 294.8 67.2Q289.8 63.2 289.8 55.9Q289.8 47.9 295.1 43.8Q300.5 39.8 310.2 39.8H322Q321.3 35.2 319.1 32.8Q316.9 30.3 312.8 30.3Q309.6 30.3 307 31.7Q304.4 33.1 302.6 36L291 32Q292.4 28.8 295.1 25.7Q297.8 22.7 302.1 20.7Q306.5 18.8 312.8 18.8Q320.4 18.8 325.5 21.7Q330.5 24.6 333 29.8Q335.4 35.1 335.3 42.3L335 70H322.7L322.5 64.2Q320.6 67.6 317.1 69.4Q313.7 71.2 308.7 71.2ZM310.9 60.2Q314.1 60.2 316.7 58.7Q319.3 57.2 320.8 54.8Q322.3 52.4 322.3 49.8V49.6H314.8Q308.3 49.6 305.8 51.1Q303.3 52.7 303.3 55.5Q303.3 57.7 305.3 59Q307.3 60.2 310.9 60.2ZM370.6 71.2Q365.5 71.2 361.7 69.1Q357.9 66.9 355.3 62.9L354.8 70H342.3V0H355.5V26.8Q358 22.9 361.8 20.8Q365.6 18.8 370.6 18.8Q377.5 18.8 382.6 22Q387.6 25.2 390.4 31Q393.2 36.9 393.2 45Q393.2 53 390.4 58.9Q387.6 64.8 382.6 68Q377.5 71.2 370.6 71.2ZM367.2 59.1Q370.8 59.1 373.6 57.3Q376.3 55.5 377.9 52.3Q379.5 49.1 379.5 45Q379.5 40.9 378 37.7Q376.4 34.5 373.7 32.8Q370.9 31 367.3 31Q363.9 31 361.2 32.8Q358.5 34.6 357 37.8Q355.5 40.9 355.5 45Q355.5 49.1 357 52.3Q358.5 55.5 361.1 57.3Q363.8 59.1 367.2 59.1ZM417.1 71.2Q412.3 71.2 408.1 69.8Q403.9 68.3 400.7 65.5Q397.5 62.8 395.7 58.8L407 53.6Q408.5 56 411.1 57.8Q413.7 59.5 417.1 59.5Q420.4 59.5 422.2 58.5Q424 57.6 424 55.8Q424 54 422.6 53.1Q421.1 52.3 418.6 51.7L414 50.5Q406.8 48.6 402.7 44.4Q398.5 40.3 398.5 34.9Q398.5 27.2 403.5 23Q408.4 18.8 417.5 18.8Q422.2 18.8 426.3 20.2Q430.3 21.6 433.2 24.1Q436.1 26.6 437.2 29.9L426.3 34.9Q425.6 32.9 422.9 31.6Q420.2 30.4 417.5 30.4Q414.8 30.4 413.4 31.5Q411.9 32.7 411.9 34.7Q411.9 36 413.3 36.8Q414.7 37.7 417.3 38.3L423.8 39.9Q428.7 41.1 431.7 43.8Q434.6 46.4 436 49.6Q437.3 52.9 437.3 56Q437.3 60.5 434.7 64Q432 67.4 427.5 69.3Q422.9 71.2 417.1 71.2Z'

export const WORDMARK_WIDTH = 437.3
export const WORDMARK_HEIGHT = 71.2
/** Cap height / ascender line to baseline, in the same units (the rest is overshoot). */
export const WORDMARK_CAP = 70

/* ---------- Emblem ---------- */

/**
 * The emblem: one slender petal (a curved kite, narrow at the hub and pointed
 * at the tip) repeated 8 times at 45° around a solid centre diamond. 48 x 48
 * grid, drawn with a 2.25 stroke and round joins. Coordinates are
 * pre-rotated so each petal is a plain path (no transforms needed in masks).
 */
export const EMBLEM_PETALS = [
  'M24 18.2C21 14.84 21 7.78 24 1.4C27 7.78 27 14.84 24 18.2Z',
  'M28.1 19.9C28.36 15.4 33.35 10.41 39.98 8.02C37.59 14.65 32.6 19.64 28.1 19.9Z',
  'M29.8 24C33.16 21 40.22 21 46.6 24C40.22 27 33.16 27 29.8 24Z',
  'M28.1 28.1C32.6 28.36 37.59 33.35 39.98 39.98C33.35 37.59 28.36 32.6 28.1 28.1Z',
  'M24 29.8C27 33.16 27 40.22 24 46.6C21 40.22 21 33.16 24 29.8Z',
  'M19.9 28.1C19.64 32.6 14.65 37.59 8.02 39.98C10.41 33.35 15.4 28.36 19.9 28.1Z',
  'M18.2 24C14.84 27 7.78 27 1.4 24C7.78 21 14.84 21 18.2 24Z',
  'M19.9 19.9C15.4 19.64 10.41 14.65 8.02 8.02C14.65 10.41 19.64 15.4 19.9 19.9Z',
] as const

export const EMBLEM_PETALS_PATH = EMBLEM_PETALS.join('')
export const EMBLEM_DIAMOND = 'M24 20.6 27.4 24 24 27.4 20.6 24Z'
export const EMBLEM_STROKE = 2.25

/* ---------- Ornament ---------- */

/**
 * Crest ornament on a 208 x 32 grid: a tapered hairline baseline under two
 * mirrored sprigs that curl outward from a small centre diamond. Each sprig
 * is one monoline stem (stroke 1.6) carrying two solid leaves.
 * Paths are drawn for the right half; the left half mirrors them.
 */
export const ORNAMENT_BASELINE = 'M8 29.4Q104 28 200 29.4Q104 30.8 8 29.4Z'
export const ORNAMENT_DIAMOND = 'M104 12.6 107.8 16.4 104 20.2 100.2 16.4Z'
/** Stem: leaves the diamond, dips, rises to a crest and curls inward. */
export const ORNAMENT_STEM =
  'M110.2 16.4C117.4 16.4 121.6 22.6 130.4 22.6C141.8 22.6 145.6 6.2 158.6 6.2C168.2 6.2 175.6 11.4 175.6 17.8C175.6 22.8 171.2 25 167.8 23.2C164.6 21.4 165.2 16.8 168.8 16.6C171 16.5 172.2 18.2 171.6 19.8'
/** Two leaves on the stem: one rising, one hanging. */
export const ORNAMENT_LEAVES =
  'M139 19.2C133.8 17 131.4 12.4 132.8 6.8C138 9.2 140.4 13.8 139 19.2ZM149.6 11.4C155.2 12.6 158.2 17 157.2 22.4C151.8 21 149 16.6 149.6 11.4Z'
