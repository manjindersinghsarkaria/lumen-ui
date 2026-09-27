import { getCurrentInstance, inject, ref, type App, type InjectionKey, type Ref } from 'vue'
import enMessages from './locales/en'

/**
 * Built-in lightweight i18n for lumen-ui — zero dependencies.
 *
 * - `createLumenI18n({ locale, messages })` installs as a Vue plugin.
 * - `useI18n()` returns the provided instance, or a shared English fallback
 *   when the plugin was never installed (so components work standalone).
 * - Keys are dot-notated (`t('common.close')`), missing keys fall back to
 *   English, then to the key itself. `{name}` params are interpolated.
 */

export type Messages = {
  [key: string]: string | Messages
}

export interface LumenI18nOptions {
  locale?: string
  messages?: Record<string, Messages>
}

export interface LumenI18n {
  locale: Ref<string>
  t: (key: string, params?: Record<string, string | number>) => string
  setLocale: (locale: string) => void
  addMessages: (locale: string, dict: Messages) => void
}

export interface LumenI18nPlugin extends LumenI18n {
  install: (app: App) => void
}

const I18N_KEY: InjectionKey<LumenI18n> = Symbol('lumen-i18n')

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Recursively merge `source` into `target` (arrays/strings are replaced). */
export function deepMerge(target: Messages, source: Messages): Messages {
  const out: Messages = { ...target }
  for (const [key, value] of Object.entries(source)) {
    const existing = out[key]
    if (isPlainObject(value) && isPlainObject(existing)) {
      out[key] = deepMerge(existing as Messages, value as Messages)
    } else {
      out[key] = value
    }
  }
  return out
}

function lookup(messages: Messages | undefined, key: string): string | undefined {
  if (!messages) return undefined
  let node: string | Messages | undefined = messages
  for (const part of key.split('.')) {
    if (!isPlainObject(node)) return undefined
    node = (node as Messages)[part] as string | Messages | undefined
  }
  return typeof node === 'string' ? node : undefined
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match: string, name: string) =>
    params[name] !== undefined ? String(params[name]) : match,
  )
}

export function createLumenI18n(options: LumenI18nOptions = {}): LumenI18nPlugin {
  const messages: Record<string, Messages> = { en: enMessages }
  if (options.messages) {
    for (const [locale, dict] of Object.entries(options.messages)) {
      messages[locale] = deepMerge(messages[locale] ?? {}, dict)
    }
  }
  const locale = ref(options.locale ?? 'en')

  const t = (key: string, params?: Record<string, string | number>): string =>
    interpolate(lookup(messages[locale.value], key) ?? lookup(messages.en, key) ?? key, params)

  const api: LumenI18n = {
    locale,
    t,
    setLocale: (next: string): void => {
      locale.value = next
    },
    addMessages: (targetLocale: string, dict: Messages): void => {
      messages[targetLocale] = deepMerge(messages[targetLocale] ?? {}, dict)
    },
  }

  return {
    ...api,
    install: (app: App): void => {
      app.provide(I18N_KEY, api)
    },
  }
}

let defaultI18n: LumenI18n | null = null

function getDefaultI18n(): LumenI18n {
  if (!defaultI18n) {
    const { install: _install, ...api } = createLumenI18n()
    void _install
    defaultI18n = api
  }
  return defaultI18n
}

/**
 * Resolve the i18n instance: the plugin-provided one when installed,
 * otherwise a shared English fallback (no plugin required).
 */
export function useI18n(): LumenI18n {
  // Avoid Vue's "inject() outside setup()" warning when called in plain tests.
  if (getCurrentInstance()) {
    const provided = inject(I18N_KEY, null)
    if (provided) return provided
  }
  return getDefaultI18n()
}
