import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Accordion } from './index'
import type { AccordionItem } from './Accordion.vue'

const items: AccordionItem[] = [
  { key: 'a', title: 'Section A' },
  { key: 'b', title: 'Section B' },
  { key: 'c', title: 'Section C', disabled: true },
]

describe('Accordion', () => {
  it('renders items collapsed initially', () => {
    const wrapper = mount(Accordion, { props: { items } })
    const headers = wrapper.findAll('.lumen-accordion__header')
    expect(headers).toHaveLength(3)
    expect(headers[0].text()).toContain('Section A')
    for (const panel of wrapper.findAll('.lumen-accordion__panel')) {
      expect(panel.isVisible()).toBe(false)
    }
    expect(headers[0].attributes('aria-expanded')).toBe('false')
  })

  it('toggles a section on click and emits update:modelValue + change', async () => {
    const wrapper = mount(Accordion, { props: { items, modelValue: [] } })
    await wrapper.findAll('.lumen-accordion__header')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[['a']]])
    expect(wrapper.emitted('change')).toEqual([[['a']]])
    await wrapper.setProps({ modelValue: ['a'] })
    expect(wrapper.findAll('.lumen-accordion__panel')[0].isVisible()).toBe(true)
    expect(wrapper.findAll('.lumen-accordion__header')[0].attributes('aria-expanded')).toBe(
      'true',
    )
    // clicking again closes it
    await wrapper.findAll('.lumen-accordion__header')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')![1]).toEqual([[]])
  })

  it('allows multiple sections open by default', async () => {
    const wrapper = mount(Accordion, { props: { items, modelValue: ['a'] } })
    await wrapper.findAll('.lumen-accordion__header')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['a', 'b']])
  })

  it('in accordion mode opening one section closes the others', async () => {
    const wrapper = mount(Accordion, { props: { items, modelValue: ['a'], accordion: true } })
    await wrapper.findAll('.lumen-accordion__header')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([['b']])
  })

  it('does not toggle disabled items', async () => {
    const wrapper = mount(Accordion, { props: { items, modelValue: [] } })
    await wrapper.findAll('.lumen-accordion__header')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('applies expand-icon position classes', () => {
    const right = mount(Accordion, { props: { items } })
    expect(right.get('.lumen-accordion').classes()).toContain('lumen-accordion--icon-right')
    const left = mount(Accordion, { props: { items, expandIconPosition: 'left' } })
    expect(left.get('.lumen-accordion').classes()).toContain('lumen-accordion--icon-left')
  })

  it('renders title and content slots', () => {
    const wrapper = mount(Accordion, {
      props: { items, modelValue: ['a'] },
      slots: {
        title: '<span class="t">T: {{ params.item.title }}</span>',
        content: '<p class="c">Content for {{ params.item.key }}</p>',
      },
    })
    expect(wrapper.findAll('.t')[0].text()).toBe('T: Section A')
    expect(wrapper.get('.c').text()).toBe('Content for a')
  })

  it('wires aria attributes between headers and panels', () => {
    const wrapper = mount(Accordion, { props: { items, modelValue: ['b'] } })
    const header = wrapper.findAll('.lumen-accordion__header')[1]
    const panel = wrapper.findAll('.lumen-accordion__panel')[1]
    expect(header.attributes('aria-controls')).toBe(panel.attributes('id'))
    expect(panel.attributes('aria-labelledby')).toBe(header.attributes('id'))
    expect(panel.attributes('role')).toBe('region')
  })

  it('moves focus between headers with arrow keys', async () => {
    const wrapper = mount(Accordion, {
      props: { items },
      attachTo: document.body,
    })
    const headers = wrapper.findAll('.lumen-accordion__header')
    await headers[0].trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(headers[1].element)
    // skips the disabled third header and wraps to the first
    await headers[1].trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(headers[0].element)
    wrapper.unmount()
  })
})
