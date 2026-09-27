import { describe, expect, it } from 'vitest'
import {
  contrastRatio,
  generateScale,
  isValidHex,
  luminance,
  mix,
  normalizeHex,
  onColor,
} from './palette'

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const

describe('palette', () => {
  it('normalizes shorthand and case', () => {
    expect(normalizeHex('#f00')).toBe('#ff0000')
    expect(normalizeHex('  #ABCDEF ')).toBe('#abcdef')
  })

  it('validates hex strings', () => {
    expect(isValidHex('#ff0000')).toBe(true)
    expect(isValidHex('#f00')).toBe(true)
    expect(isValidHex('red')).toBe(false)
    expect(isValidHex('#ff000')).toBe(false)
  })

  it('throws on invalid hex', () => {
    expect(() => normalizeHex('not-a-color')).toThrow(/invalid hex color/)
  })

  it('generates a 50–900 scale with 500 === base, all valid hex', () => {
    const scale = generateScale('#4f46e5')
    expect(scale[500]).toBe('#4f46e5')
    for (const shade of SHADES) {
      expect(scale[shade]).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it('gets strictly darker from 50 to 900', () => {
    const scale = generateScale('#4f46e5')
    const lum = SHADES.map((shade) => luminance(scale[shade]))
    for (let i = 1; i < lum.length; i++) {
      expect(lum[i]).toBeLessThan(lum[i - 1])
    }
  })

  it('derives sane scales for extreme bases', () => {
    const black = generateScale('#000000')
    expect(black[500]).toBe('#000000')
    expect(luminance(black[50])).toBeGreaterThan(luminance(black[900]))
    const white = generateScale('#ffffff')
    expect(white[500]).toBe('#ffffff')
    expect(luminance(white[50])).toBeGreaterThan(luminance(white[900]))
  })

  it('picks readable on-colors', () => {
    expect(onColor('#000000')).toBe('#ffffff')
    expect(onColor('#ffffff')).toBe('#111827')
    // on-colors always meet a 4.5:1 contrast minimum against their background
    for (const bg of ['#4f46e5', '#0ea5e9', '#16a34a', '#d97706', '#dc2626', '#f1f0fd']) {
      expect(contrastRatio(bg, onColor(bg))).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('mixes two colors by weight', () => {
    expect(mix('#ff0000', '#0000ff', 0.5)).toBe('#800080')
    expect(mix('#ff0000', '#0000ff', 1)).toBe('#ff0000')
    expect(mix('#ff0000', '#0000ff', 0)).toBe('#0000ff')
  })
})
