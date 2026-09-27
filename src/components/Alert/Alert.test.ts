import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Alert } from './index'

describe('Alert', () => {
  it('renders the default slot with info styling and role=alert', () => {
    const wrapper = mount(Alert, { slots: { default: 'Heads up' } })
    const alert = wrapper.get('.lumen-alert')
    expect(alert.classes()).toContain('lumen-alert--info')
    expect(alert.attributes('role')).toBe('alert')
    expect(wrapper.get('.lumen-alert__body').text()).toBe('Heads up')
  })

  it('applies variant classes', () => {
    for (const variant of ['success', 'warning', 'danger'] as const) {
      const wrapper = mount(Alert, { props: { variant } })
      expect(wrapper.get('.lumen-alert').classes()).toContain(`lumen-alert--${variant}`)
    }
  })

  it('renders title and description slots', () => {
    const wrapper = mount(Alert, {
      props: { title: 'Title prop' },
      slots: { description: 'More detail' },
    })
    expect(wrapper.get('.lumen-alert__title').text()).toBe('Title prop')
    expect(wrapper.get('.lumen-alert__description').text()).toBe('More detail')
  })

  it('the title slot overrides the title prop', () => {
    const wrapper = mount(Alert, {
      props: { title: 'Title prop' },
      slots: { title: 'Custom title' },
    })
    expect(wrapper.get('.lumen-alert__title').text()).toBe('Custom title')
  })

  it('closable hides on close click and emits close', async () => {
    const wrapper = mount(Alert, {
      props: { closable: true },
      slots: { default: 'Dismiss me' },
    })
    const close = wrapper.get('.lumen-alert__close')
    expect(close.attributes('aria-label')).toBe('Close alert')
    await close.trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.find('.lumen-alert').exists()).toBe(false)
  })

  it('supports a custom close label', () => {
    const wrapper = mount(Alert, { props: { closable: true, closeLabel: 'Fermer' } })
    expect(wrapper.get('.lumen-alert__close').attributes('aria-label')).toBe('Fermer')
  })

  it('shows the icon by default and hides it with showIcon=false', () => {
    const shown = mount(Alert)
    expect(shown.find('.lumen-alert__icon').exists()).toBe(true)
    const hidden = mount(Alert, { props: { showIcon: false } })
    expect(hidden.find('.lumen-alert__icon').exists()).toBe(false)
  })

  it('supports a custom role', () => {
    const wrapper = mount(Alert, { props: { role: 'status' } })
    expect(wrapper.get('.lumen-alert').attributes('role')).toBe('status')
  })
})
