import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Switch } from './index'

describe('Switch', () => {
  it('renders off by default with role=switch', () => {
    const wrapper = mount(Switch)
    const btn = wrapper.get('button[role="switch"]')
    expect(btn.attributes('aria-checked')).toBe('false')
    expect(btn.classes()).toContain('lumen-switch--md')
    expect(btn.classes()).not.toContain('lumen-switch--on')
  })

  it('toggles on click', async () => {
    const wrapper = mount(Switch, { props: { modelValue: false } })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
    expect(wrapper.emitted('change')).toEqual([[true]])
  })

  it('reflects a true model', () => {
    const wrapper = mount(Switch, { props: { modelValue: true } })
    const btn = wrapper.get('button')
    expect(btn.attributes('aria-checked')).toBe('true')
    expect(btn.classes()).toContain('lumen-switch--on')
  })

  it('does not toggle when disabled', async () => {
    const wrapper = mount(Switch, { props: { modelValue: false, disabled: true } })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('loading shows a spinner and blocks interaction', async () => {
    const wrapper = mount(Switch, { props: { modelValue: false, loading: true } })
    const btn = wrapper.get('button')
    expect(btn.attributes('disabled')).toBeDefined()
    expect(wrapper.find('.lumen-switch__spinner').exists()).toBe(true)
    expect(wrapper.find('.lumen-switch__thumb').exists()).toBe(false)
    await btn.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('applies size classes', () => {
    const wrapper = mount(Switch, { props: { size: 'lg' } })
    expect(wrapper.get('button').classes()).toContain('lumen-switch--lg')
  })

  it('shows checked/unchecked labels', async () => {
    const wrapper = mount(Switch, {
      props: { modelValue: false, checkedLabel: 'On', uncheckedLabel: 'Off' },
    })
    expect(wrapper.get('.lumen-switch__label').text()).toBe('Off')
    await wrapper.setProps({ modelValue: true })
    expect(wrapper.get('.lumen-switch__label').text()).toBe('On')
  })

  it('hides the label when no labels are given', () => {
    const wrapper = mount(Switch)
    expect(wrapper.find('.lumen-switch__label').exists()).toBe(false)
  })
})
