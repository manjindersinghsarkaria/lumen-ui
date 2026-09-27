import { computed, ref } from 'vue'
import { generateScale, normalizeHex, onColor, type ColorScale } from './palette'

/**
 * Theming core: a module-level singleton so every component shares one theme.
 * `setTheme()` / `setMode()` write CSS custom properties + `data-theme` onto
 * `document.documentElement`; `<ThemeProvider>` scopes the same to a subtree.
 */

export type ThemeMode = 'light' | 'dark' | 'auto'

export interface ThemeColors {
  primary: string
  secondary?: string
  success?: string
  warning?: string
  danger?: string
  info?: string
}

export const DEFAULT_COLORS: Required<ThemeColors> = {
  primary: '#4f46e5',
  secondary: '#0ea5e9',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#0284c7',
}

export const DEFAULT_MODE: ThemeMode = 'light'

const COLOR_KEYS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'] as const
type ColorKey = (typeof COLOR_KEYS)[number]

const VAR_PREFIX = '--lumen'
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const

// --- singleton state ----------------------------------------------------------
const colors = ref<Required<ThemeColors>>({ ...DEFAULT_COLORS })
const mode = ref<ThemeMode>(DEFAULT_MODE)
const systemDark = ref(false)

let mql: MediaQueryList | null = null

function ensureSystemListener(): void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
  if (mql) return
  mql = window.matchMedia('(prefers-color-scheme: dark)')
  systemDark.value = mql.matches
  mql.addEventListener('change', (e: MediaQueryListEvent) => {
    systemDark.value = e.matches
  })
}

/** The effective mode after resolving 'auto' against the OS preference. */
export const resolvedMode = computed<'light' | 'dark'>(() =>
  mode.value === 'auto' ? (systemDark.value ? 'dark' : 'light') : mode.value,
)

function validateColors(input: ThemeColors): Required<ThemeColors> {
  const out: Required<ThemeColors> = { ...DEFAULT_COLORS }
  for (const key of COLOR_KEYS) {
    const v: string | undefined = input[key]
    if (v !== undefined) {
      out[key] = normalizeHex(v) // throws on invalid hex
    }
  }
  return out
}

/**
 * Write the palette CSS vars and `data-theme` onto an element.
 * Pass explicit colors/mode to scope a subtree (used by ThemeProvider);
 * omit them to apply the current global theme.
 */
export function applyTheme(el: HTMLElement, themeColors?: ThemeColors, themeMode?: ThemeMode): void {
  const c: Required<ThemeColors> = themeColors ? validateColors(themeColors) : colors.value
  const m: ThemeMode = themeMode ?? mode.value
  const resolved: 'light' | 'dark' = m === 'auto' ? (systemDark.value ? 'dark' : 'light') : m
  for (const key of COLOR_KEYS) {
    const k: ColorKey = key
    const scale: ColorScale = generateScale(c[k])
    for (const shade of SHADES) {
      el.style.setProperty(`${VAR_PREFIX}-${k}-${shade}`, scale[shade])
    }
    el.style.setProperty(`${VAR_PREFIX}-${k}`, scale[600])
    el.style.setProperty(`${VAR_PREFIX}-on-${k}`, onColor(scale[600]))
  }
  el.dataset.theme = resolved
}

/** Set the org palette (any subset of keys; rest fall back to defaults). */
export function setTheme(input: ThemeColors): void {
  ensureSystemListener()
  colors.value = validateColors(input)
  if (typeof document !== 'undefined') {
    applyTheme(document.documentElement)
  }
}

/** Set the color-scheme mode globally. */
export function setMode(m: ThemeMode): void {
  ensureSystemListener()
  mode.value = m
  if (typeof document !== 'undefined') {
    applyTheme(document.documentElement)
  }
}

/** Restore the default palette + light mode (also used to isolate tests). */
export function resetTheme(): void {
  colors.value = { ...DEFAULT_COLORS }
  mode.value = DEFAULT_MODE
  systemDark.value = false
  if (typeof document !== 'undefined') {
    applyTheme(document.documentElement)
  }
}

export function useTheme() {
  ensureSystemListener()
  return {
    colors,
    mode,
    systemDark,
    resolvedMode,
    setTheme,
    setMode,
    resetTheme,
    applyTheme,
  }
}
