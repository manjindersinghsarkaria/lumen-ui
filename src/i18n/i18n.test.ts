import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { createLumenI18n, deepMerge, useI18n } from './i18n'

describe('createLumenI18n', () => {
  it('translates nested keys from the default English dictionary', () => {
    const i18n = createLumenI18n()
    expect(i18n.t('common.close')).toBe('Close')
    expect(i18n.t('common.loading')).toBe('Loading')
  })

  it('interpolates {name} params', () => {
    const i18n = createLumenI18n()
    i18n.addMessages('en', { test: { hello: 'Hello, {name}! You have {count} messages.' } })
    expect(i18n.t('test.hello', { name: 'Ada', count: 3 })).toBe('Hello, Ada! You have 3 messages.')
  })

  it('leaves unknown placeholders untouched', () => {
    const i18n = createLumenI18n()
    i18n.addMessages('en', { test: { hello: 'Hello, {name}!' } })
    expect(i18n.t('test.hello')).toBe('Hello, {name}!')
    expect(i18n.t('test.hello', { other: 'x' })).toBe('Hello, {name}!')
  })

  it('setLocale switches the active locale', () => {
    const i18n = createLumenI18n({
      messages: { fr: { common: { close: 'Fermer' } } },
    })
    expect(i18n.locale.value).toBe('en')
    i18n.setLocale('fr')
    expect(i18n.locale.value).toBe('fr')
    expect(i18n.t('common.close')).toBe('Fermer')
  })

  it('falls back to English for keys missing in the active locale', () => {
    const i18n = createLumenI18n({
      locale: 'fr',
      messages: { fr: { common: { close: 'Fermer' } } },
    })
    expect(i18n.t('common.close')).toBe('Fermer')
    expect(i18n.t('common.loading')).toBe('Loading') // missing in fr → en
  })

  it('returns the key itself when missing everywhere', () => {
    const i18n = createLumenI18n()
    expect(i18n.t('totally.unknown.key')).toBe('totally.unknown.key')
  })

  it('addMessages deep-merges without clobbering sibling keys', () => {
    const i18n = createLumenI18n()
    i18n.addMessages('en', { common: { close: 'Shut' } })
    expect(i18n.t('common.close')).toBe('Shut')
    expect(i18n.t('common.loading')).toBe('Loading') // sibling preserved
    i18n.addMessages('de', { common: { close: 'Schließen' } })
    i18n.setLocale('de')
    expect(i18n.t('common.close')).toBe('Schließen')
  })

  it('merges constructor messages over the English defaults', () => {
    const i18n = createLumenI18n({ messages: { en: { common: { close: 'Shut' } } } })
    expect(i18n.t('common.close')).toBe('Shut')
    expect(i18n.t('common.cancel')).toBe('Cancel')
  })
})

describe('deepMerge', () => {
  it('recursively merges plain objects and replaces scalars', () => {
    expect(
      deepMerge(
        { a: { x: '1', y: '2' }, b: 'old' },
        { a: { y: 'new', z: '3' }, b: 'new', c: 'added' },
      ),
    ).toEqual({ a: { x: '1', y: 'new', z: '3' }, b: 'new', c: 'added' })
  })
})

describe('useI18n', () => {
  it('falls back to English when no plugin is installed', () => {
    const { t, locale } = useI18n()
    expect(locale.value).toBe('en')
    expect(t('common.close')).toBe('Close')
  })

  it('resolves the plugin-provided instance inside components', () => {
    const Comp = defineComponent({
      setup() {
        const { t } = useI18n()
        return () => h('span', t('common.close'))
      },
    })
    const wrapper = mount(Comp, {
      global: {
        plugins: [
          createLumenI18n({
            locale: 'fr',
            messages: { fr: { common: { close: 'Fermer' } } },
          }),
        ],
      },
    })
    expect(wrapper.text()).toBe('Fermer')
  })
})
