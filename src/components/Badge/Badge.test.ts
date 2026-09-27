import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Badge } from './index'

describe('Badge', () => {
  it('renders the count anchored to the slot content', () => {
    const wrapper = mount(Badge, {
      props: { count: 5 },
      slots: { default: '<button>Inbox</button>' },
    })
    expect(wrapper.get('.lumen-badge__sup').text()).toBe('5')
    expect(wrapper.get('.lumen-badge__sup').classes()).toContain('lumen-badge__sup--danger')
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('caps the count at max with a "+" suffix', () => {
    const wrapper = mount(Badge, { props: { count: 150 } })
    expect(wrapper.get('.lumen-badge__sup').text()).toBe('99+')
  })

  it('respects a custom max', () => {
    const wrapper = mount(Badge, { props: { count: 150, max: 9 } })
    expect(wrapper.get('.lumen-badge__sup').text()).toBe('9+')
  })

  it('renders a dot in dot mode without count text', () => {
    const wrapper = mount(Badge, { props: { dot: true, variant: 'success' } })
    const sup = wrapper.get('.lumen-badge__sup')
    expect(sup.classes()).toContain('lumen-badge__sup--dot')
    expect(sup.classes()).toContain('lumen-badge__sup--success')
    expect(sup.text()).toBe('')
  })

  it('applies variant classes', () => {
    const wrapper = mount(Badge, { props: { count: 3, variant: 'info' } })
    expect(wrapper.get('.lumen-badge__sup').classes()).toContain('lumen-badge__sup--info')
  })

  it('hides a zero count unless showZero', () => {
    const hidden = mount(Badge, { props: { count: 0 } })
    expect(hidden.find('.lumen-badge__sup').exists()).toBe(false)
    const shown = mount(Badge, { props: { count: 0, showZero: true } })
    expect(shown.get('.lumen-badge__sup').text()).toBe('0')
  })

  it('hides the badge without a count or dot', () => {
    const wrapper = mount(Badge, { slots: { default: 'x' } })
    expect(wrapper.find('.lumen-badge__sup').exists()).toBe(false)
  })

  it('applies the offset as a transform', () => {
    const wrapper = mount(Badge, { props: { count: 2, offset: [4, -6] } })
    const style = wrapper.get('.lumen-badge__sup').attributes('style') ?? ''
    expect(style).toContain('translate(calc(50% + 4px), calc(-50% + -6px))')
  })

  it('renders strings as-is', () => {
    const wrapper = mount(Badge, { props: { count: 'new' } })
    expect(wrapper.get('.lumen-badge__sup').text()).toBe('new')
  })
})
