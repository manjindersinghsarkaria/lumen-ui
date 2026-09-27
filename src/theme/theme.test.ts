import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import {
  applyTheme,
  DEFAULT_COLORS,
  resetTheme,
  resolvedMode,
  setMode,
  setTheme,
  useTheme,
} from './theme'
import ThemeProvider from './ThemeProvider.vue'

beforeEach(() => {
  resetTheme()
})

describe('useTheme', () => {
  it('applies the default palette vars to documentElement on reset', () => {
    const el = document.documentElement
    expect(el.style.getPropertyValue('--lumen-primary-500')).toBe(DEFAULT_COLORS.primary)
    expect(el.style.getPropertyValue('--lumen-danger-500')).toBe(DEFAULT_COLORS.danger)
    expect(el.dataset.theme).toBe('light')
  })

  it('setTheme derives a full scale from one hex and writes CSS vars', () => {
    setTheme({ primary: '#ff0000' })
    const el = document.documentElement
    expect(el.style.getPropertyValue('--lumen-primary-500')).toBe('#ff0000')
    expect(el.style.getPropertyValue('--lumen-primary')).toBeTruthy()
    expect(el.style.getPropertyValue('--lumen-on-primary')).toBe('#ffffff')
    // untouched keys keep their defaults
    expect(el.style.getPropertyValue('--lumen-secondary-500')).toBe(DEFAULT_COLORS.secondary)
  })

  it('setTheme throws on invalid hex and leaves the old theme intact', () => {
    expect(() => setTheme({ primary: 'not-a-color' })).toThrow(/invalid hex color/)
    expect(document.documentElement.style.getPropertyValue('--lumen-primary-500')).toBe(
      DEFAULT_COLORS.primary,
    )
  })

  it('setMode("dark") sets data-theme="dark" and resolvedMode', () => {
    setMode('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(resolvedMode.value).toBe('dark')
    const { resolvedMode: rm, mode } = useTheme()
    expect(rm.value).toBe('dark')
    expect(mode.value).toBe('dark')
  })

  it('auto mode resolves to light when no OS preference is detectable', () => {
    setMode('auto')
    expect(resolvedMode.value).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })

  it('applyTheme can target a specific element without touching the document', () => {
    const div = document.createElement('div')
    applyTheme(div, { primary: '#00ff00' }, 'dark')
    expect(div.style.getPropertyValue('--lumen-primary-500')).toBe('#00ff00')
    expect(div.dataset.theme).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})

describe('ThemeProvider', () => {
  it('applies vars + data-theme to its root and renders the slot', () => {
    const wrapper = mount(ThemeProvider, {
      props: { colors: { primary: '#123456' }, mode: 'dark' },
      slots: { default: 'hello' },
    })
    const el = wrapper.element as HTMLElement
    expect(el.classList.contains('lumen-theme-provider')).toBe(true)
    expect(el.dataset.theme).toBe('dark')
    expect(el.style.getPropertyValue('--lumen-primary-500')).toBe('#123456')
    expect(wrapper.text()).toContain('hello')
  })

  it('falls back to the global theme when no props are given', () => {
    setTheme({ primary: '#abcdef' })
    const wrapper = mount(ThemeProvider, { slots: { default: 'x' } })
    const el = wrapper.element as HTMLElement
    expect(el.style.getPropertyValue('--lumen-primary-500')).toBe('#abcdef')
    expect(el.dataset.theme).toBe('light')
  })
})
