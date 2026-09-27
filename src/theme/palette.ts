/**
 * Color utilities and palette-scale generation for lumen-ui theming.
 *
 * A full 50–900 scale is derived from a single brand hex by mixing toward
 * white (light shades) and black (dark shades). Only erasable TypeScript is
 * used here so the module can also run under Node's type stripping.
 */

export type Shade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
export type ColorScale = Record<Shade, string>

export interface Rgb {
  r: number
  g: number
  b: number
}

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

export function isValidHex(hex: string): boolean {
  return HEX_RE.test(hex.trim())
}

/** Normalize to lowercase 7-char `#rrggbb`. Throws on invalid input. */
export function normalizeHex(hex: string): string {
  const h = hex.trim().toLowerCase()
  if (!isValidHex(h)) {
    throw new Error(`lumen-ui: invalid hex color "${hex}" — expected "#rgb" or "#rrggbb"`)
  }
  if (h.length === 4) {
    return `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`
  }
  return h
}

export function hexToRgb(hex: string): Rgb {
  const h = normalizeHex(hex)
  return {
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16),
  }
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number): string =>
    Math.round(Math.min(255, Math.max(0, n)))
      .toString(16)
      .padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

/** Mix two hex colors. `weight` is the proportion of `a` (0..1). */
export function mix(a: string, b: string, weight: number): string {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  const w = Math.min(1, Math.max(0, weight))
  return rgbToHex(ca.r * w + cb.r * (1 - w), ca.g * w + cb.g * (1 - w), ca.b * w + cb.b * (1 - w))
}

const SHADES: Shade[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

// Proportion of the base color when mixed with white (light shades) / black (dark shades).
const LIGHT_MIX: Record<number, number> = { 50: 0.08, 100: 0.16, 200: 0.32, 300: 0.48, 400: 0.72 }
const DARK_MIX: Record<number, number> = { 600: 0.85, 700: 0.68, 800: 0.48, 900: 0.32 }

/** Derive a 50–900 scale from a single base hex (500 === base). */
export function generateScale(baseHex: string): ColorScale {
  const base = normalizeHex(baseHex)
  const scale = {} as ColorScale
  for (const s of SHADES) {
    if (s === 500) {
      scale[s] = base
    } else if (s < 500) {
      scale[s] = mix(base, '#ffffff', LIGHT_MIX[s])
    } else {
      scale[s] = mix(base, '#000000', DARK_MIX[s])
    }
  }
  return scale
}

/** WCAG relative luminance (0..1). */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const f = (v: number): number => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

/** WCAG contrast ratio between two hex colors (1..21). */
export function contrastRatio(a: string, b: string): number {
  const l1 = luminance(a)
  const l2 = luminance(b)
  const hi = Math.max(l1, l2)
  const lo = Math.min(l1, l2)
  return (hi + 0.05) / (lo + 0.05)
}

export const ON_DARK_BG = '#ffffff'
export const ON_LIGHT_BG = '#111827' // gray-900 — softer than pure black, still hits 4.5:1 on mid-tones

/** Pick a readable text color for the given background hex. */
export function onColor(hex: string): string {
  const bg = normalizeHex(hex)
  return contrastRatio(bg, ON_DARK_BG) >= contrastRatio(bg, ON_LIGHT_BG) ? ON_DARK_BG : ON_LIGHT_BG
}
