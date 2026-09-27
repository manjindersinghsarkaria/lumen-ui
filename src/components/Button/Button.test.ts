import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Button } from './index'

describe('Button', () => {
  it('renders the default slot with primary/md classes', () => {
    const wrapper = mount(Button, { slots: { default: 'Click me' } })
    const btn = wrapper.get('button.lumen-btn')
    expect(btn.text()).toBe('Click me')
    expect(btn.classes()).toContain('lumen-btn--primary')
    expect(btn.classes()).toContain('lumen-btn--md')
    expect(btn.attributes('type')).toBe('button')
  })

  it('applies variant and size classes from props', () => {
    const wrapper = mount(Button, {
      props: { variant: 'danger', size: 'lg' },
      slots: { default: 'Delete' },
    })
    const btn = wrapper.get('button')
    expect(btn.classes()).toContain('lumen-btn--danger')
    expect(btn.classes()).toContain('lumen-btn--lg')
    expect(btn.classes()).not.toContain('lumen-btn--primary')
  })

  it.each(['primary', 'secondary', 'outline', 'ghost', 'danger'] as const)(
    'renders variant %s',
    (variant) => {
      const wrapper = mount(Button, { props: { variant } })
      expect(wrapper.get('button').classes()).toContain(`lumen-btn--${variant}`)
    },
  )

  it.each(['sm', 'md', 'lg'] as const)('renders size %s', (size) => {
    const wrapper = mount(Button, { props: { size } })
    expect(wrapper.get('button').classes()).toContain(`lumen-btn--${size}`)
  })

  it('emits click when enabled', async () => {
    const wrapper = mount(Button, { slots: { default: 'Go' } })
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, { props: { disabled: true } })
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('loading shows a spinner, disables the button, and blocks clicks', async () => {
    const wrapper = mount(Button, { props: { loading: true }, slots: { default: 'Save' } })
    const btn = wrapper.get('button')
    expect(btn.classes()).toContain('lumen-btn--loading')
    expect(btn.attributes('disabled')).toBeDefined()
    expect(btn.attributes('aria-busy')).toBe('true')
    const spinner = btn.get('.lumen-btn__spinner')
    expect(spinner.attributes('role')).toBe('status')
    await btn.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('block adds the full-width class', () => {
    const wrapper = mount(Button, { props: { block: true } })
    expect(wrapper.get('button').classes()).toContain('lumen-btn--block')
  })

  it('renders the icon slot', () => {
    const wrapper = mount(Button, {
      slots: { icon: '<svg class="my-icon" />', default: 'With icon' },
    })
    expect(wrapper.get('.lumen-btn__icon .my-icon').exists()).toBe(true)
  })

  it('hides the icon slot while loading', () => {
    const wrapper = mount(Button, {
      props: { loading: true },
      slots: { icon: '<svg class="my-icon" />' },
    })
    expect(wrapper.find('.lumen-btn__icon').exists()).toBe(false)
    expect(wrapper.find('.lumen-btn__spinner').exists()).toBe(true)
  })
})
