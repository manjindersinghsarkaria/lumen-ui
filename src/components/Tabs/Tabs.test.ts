import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Tabs } from './index'
import type { TabItem } from './Tabs.vue'

const items: TabItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'details', label: 'Details' },
  { key: 'settings', label: 'Settings', disabled: true },
]

describe('Tabs', () => {
  it('renders items with the active tab from v-model', () => {
    const wrapper = mount(Tabs, { props: { items, modelValue: 'details' } })
    const tabs = wrapper.findAll('.lumen-tabs__tab')
    expect(tabs).toHaveLength(3)
    expect(tabs[1].classes()).toContain('lumen-tabs__tab--active')
    expect(tabs[1].attributes('aria-selected')).toBe('true')
    expect(tabs[0].attributes('aria-selected')).toBe('false')
  })

  it('activates a tab on click and emits update:modelValue + change', async () => {
    const wrapper = mount(Tabs, { props: { items, modelValue: 'overview' } })
    await wrapper.findAll('.lumen-tabs__tab')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['details']])
    expect(wrapper.emitted('change')).toEqual([['details']])
  })

  it('does not activate disabled tabs', async () => {
    const wrapper = mount(Tabs, { props: { items, modelValue: 'overview' } })
    await wrapper.findAll('.lumen-tabs__tab')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('applies variant classes', () => {
    const line = mount(Tabs, { props: { items } })
    expect(line.get('.lumen-tabs').classes()).toContain('lumen-tabs--line')
    const card = mount(Tabs, { props: { items, variant: 'card' } })
    expect(card.get('.lumen-tabs').classes()).toContain('lumen-tabs--card')
  })

  it('emits close without activating when the close button is clicked', async () => {
    const wrapper = mount(Tabs, { props: { items, modelValue: 'overview', closable: true } })
    const close = wrapper.findAll('.lumen-tabs__close')[0]
    expect(close.attributes('aria-label')).toBe('Close tab')
    await close.trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('close')![0]).toEqual([items[0], 0])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('supports a custom close label', () => {
    const wrapper = mount(Tabs, { props: { items, closable: true, closeLabel: 'Fermer' } })
    expect(wrapper.find('.lumen-tabs__close').attributes('aria-label')).toBe('Fermer')
  })

  it('moves active tab with arrow keys, skipping disabled tabs', async () => {
    const wrapper = mount(Tabs, { props: { items, modelValue: 'overview' } })
    const tablist = wrapper.get('.lumen-tabs__tablist')
    // simulate a v-model parent syncing the prop on each emission
    const sync = async () => {
      const emitted = wrapper.emitted('update:modelValue')
      if (emitted) await wrapper.setProps({ modelValue: emitted[emitted.length - 1][0] as string | number })
    }
    await tablist.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['details'])
    await sync()
    // ArrowRight from details skips disabled settings and wraps to overview
    await tablist.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')![1]).toEqual(['overview'])
    await sync()
    await tablist.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:modelValue')![2]).toEqual(['details'])
  })

  it('supports Home and End keys', async () => {
    const wrapper = mount(Tabs, { props: { items, modelValue: 'details' } })
    const tablist = wrapper.get('.lumen-tabs__tablist')
    await tablist.trigger('keydown', { key: 'End' })
    // End would target disabled settings; falls back to last enabled
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await tablist.trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['overview'])
  })

  it('renders the extra slot and custom tab labels', () => {
    const wrapper = mount(Tabs, {
      props: { items, modelValue: 'overview' },
      slots: {
        extra: '<button class="add-btn">+</button>',
        tab: '<span class="custom-label">custom</span>',
      },
    })
    expect(wrapper.get('.lumen-tabs__extra .add-btn').element).toBeTruthy()
    expect(wrapper.findAll('.custom-label')).toHaveLength(3)
  })

  it('renders the panel slot for the active tab', () => {
    const wrapper = mount(Tabs, {
      props: { items, modelValue: 'details' },
      slots: { panel: '<p class="panel">Panel: {{ params.item.label }}</p>' },
    })
    expect(wrapper.get('.lumen-tabs__panel').attributes('role')).toBe('tabpanel')
    expect(wrapper.get('.panel').text()).toBe('Panel: Details')
  })

  it('exposes tablist semantics', () => {
    const wrapper = mount(Tabs, { props: { items } })
    const tablist = wrapper.get('.lumen-tabs__tablist')
    expect(tablist.attributes('role')).toBe('tablist')
    expect(tablist.attributes('aria-label')).toBe('Tabs')
  })
})
