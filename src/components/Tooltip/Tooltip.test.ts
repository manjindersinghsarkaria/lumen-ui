import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { Tooltip } from './index'

afterEach(() => {
  vi.useRealTimers()
})

describe('Tooltip', () => {
  it('renders the trigger slot and hides the tooltip initially', () => {
    const wrapper = mount(Tooltip, {
      props: { content: 'Hint text' },
      slots: { default: '<button>Hover me</button>' },
    })
    expect(wrapper.get('.lumen-tooltip-wrapper').text()).toContain('Hover me')
    expect(wrapper.find('.lumen-tooltip').exists()).toBe(false)
  })

  it('shows on mouseenter and hides on mouseleave with the hover trigger', async () => {
    const wrapper = mount(Tooltip, {
      props: { content: 'Hint text' },
      slots: { default: 'trigger' },
    })
    await wrapper.trigger('mouseenter')
    expect(wrapper.get('.lumen-tooltip').text()).toBe('Hint text')
    await wrapper.trigger('mouseleave')
    expect(wrapper.find('.lumen-tooltip').exists()).toBe(false)
  })

  it('prefers the content slot over the content prop', async () => {
    const wrapper = mount(Tooltip, {
      props: { content: 'prop text' },
      slots: { default: 'trigger', content: 'slot text' },
    })
    await wrapper.trigger('mouseenter')
    expect(wrapper.get('.lumen-tooltip').text()).toBe('slot text')
  })

  it('applies placement classes', async () => {
    for (const placement of ['top', 'bottom', 'left', 'right'] as const) {
      const wrapper = mount(Tooltip, {
        props: { content: 'Hint', placement },
        slots: { default: 'trigger' },
      })
      await wrapper.trigger('mouseenter')
      expect(wrapper.get('.lumen-tooltip').classes()).toContain(`lumen-tooltip--${placement}`)
    }
  })

  it('shows on focusin and hides on focusout with the focus trigger', async () => {
    const wrapper = mount(Tooltip, {
      props: { content: 'Hint', trigger: 'focus' },
      slots: { default: '<button>focus me</button>' },
    })
    await wrapper.trigger('focusin')
    expect(wrapper.find('.lumen-tooltip').exists()).toBe(true)
    await wrapper.trigger('focusout')
    expect(wrapper.find('.lumen-tooltip').exists()).toBe(false)
  })

  it('toggles on click with the click trigger and closes on outside click or Escape', async () => {
    const wrapper = mount(Tooltip, {
      props: { content: 'Hint', trigger: 'click' },
      slots: { default: 'trigger' },
      attachTo: document.body,
    })
    await wrapper.trigger('click')
    expect(wrapper.find('.lumen-tooltip').exists()).toBe(true)
    await wrapper.trigger('click')
    expect(wrapper.find('.lumen-tooltip').exists()).toBe(false)

    await wrapper.trigger('click')
    expect(wrapper.find('.lumen-tooltip').exists()).toBe(true)
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(wrapper.find('.lumen-tooltip').exists()).toBe(false)

    await wrapper.trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(wrapper.find('.lumen-tooltip').exists()).toBe(false)
    wrapper.unmount()
  })

  it('supports multiple triggers', async () => {
    const wrapper = mount(Tooltip, {
      props: { content: 'Hint', trigger: ['hover', 'focus'] },
      slots: { default: 'trigger' },
    })
    await wrapper.trigger('mouseenter')
    expect(wrapper.find('.lumen-tooltip').exists()).toBe(true)
    await wrapper.trigger('mouseleave')
    await wrapper.trigger('focusin')
    expect(wrapper.find('.lumen-tooltip').exists()).toBe(true)
  })

  it('never shows when disabled, and hides if disabled while open', async () => {
    const wrapper = mount(Tooltip, {
      props: { content: 'Hint', disabled: true },
      slots: { default: 'trigger' },
    })
    await wrapper.trigger('mouseenter')
    expect(wrapper.find('.lumen-tooltip').exists()).toBe(false)

    await wrapper.setProps({ disabled: false })
    await wrapper.trigger('mouseenter')
    expect(wrapper.find('.lumen-tooltip').exists()).toBe(true)
    await wrapper.setProps({ disabled: true })
    expect(wrapper.find('.lumen-tooltip').exists()).toBe(false)
  })

  it('does not show without content', async () => {
    const wrapper = mount(Tooltip, { slots: { default: 'trigger' } })
    await wrapper.trigger('mouseenter')
    expect(wrapper.find('.lumen-tooltip').exists()).toBe(false)
  })

  it('respects showDelay and hideDelay', async () => {
    vi.useFakeTimers()
    const wrapper = mount(Tooltip, {
      props: { content: 'Hint', showDelay: 120, hideDelay: 80 },
      slots: { default: 'trigger' },
    })
    await wrapper.trigger('mouseenter')
    expect(wrapper.find('.lumen-tooltip').exists()).toBe(false)
    vi.advanceTimersByTime(120)
    await nextTick()
    expect(wrapper.find('.lumen-tooltip').exists()).toBe(true)

    await wrapper.trigger('mouseleave')
    expect(wrapper.find('.lumen-tooltip').exists()).toBe(true)
    vi.advanceTimersByTime(80)
    await nextTick()
    expect(wrapper.find('.lumen-tooltip').exists()).toBe(false)
  })

  it('exposes role=tooltip and aria-describedby while open', async () => {
    const wrapper = mount(Tooltip, {
      props: { content: 'Hint' },
      slots: { default: 'trigger' },
    })
    await wrapper.trigger('mouseenter')
    const tip = wrapper.get('.lumen-tooltip')
    expect(tip.attributes('role')).toBe('tooltip')
    expect(tip.attributes('id')).toMatch(/^lumen-tooltip-\d+$/)
    expect(wrapper.get('.lumen-tooltip-wrapper').attributes('aria-describedby')).toBe(
      tip.attributes('id'),
    )
  })
})
