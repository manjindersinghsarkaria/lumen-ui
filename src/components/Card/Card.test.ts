import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Card } from './index'

describe('Card', () => {
  it('renders the body slot', () => {
    const wrapper = mount(Card, { slots: { default: 'Body content' } })
    expect(wrapper.get('.lumen-card__body').text()).toBe('Body content')
  })

  it('renders title and subtitle props', () => {
    const wrapper = mount(Card, { props: { title: 'Hello', subtitle: 'World' } })
    expect(wrapper.get('.lumen-card__title').text()).toBe('Hello')
    expect(wrapper.get('.lumen-card__subtitle').text()).toBe('World')
  })

  it('omits the header without title, subtitle, or header slot', () => {
    const wrapper = mount(Card, { slots: { default: 'x' } })
    expect(wrapper.find('.lumen-card__header').exists()).toBe(false)
  })

  it('the header slot overrides title/subtitle', () => {
    const wrapper = mount(Card, {
      props: { title: 'Title prop' },
      slots: { header: 'Custom header' },
    })
    expect(wrapper.get('.lumen-card__header').text()).toBe('Custom header')
    expect(wrapper.find('.lumen-card__title').exists()).toBe(false)
  })

  it('renders the footer slot', () => {
    const wrapper = mount(Card, { slots: { footer: 'Actions' } })
    expect(wrapper.get('.lumen-card__footer').text()).toBe('Actions')
  })

  it('applies bordered, shadow, and hoverable classes', () => {
    const wrapper = mount(Card, {
      props: { bordered: false, shadow: true, hoverable: true },
    })
    const card = wrapper.get('.lumen-card')
    expect(card.classes()).not.toContain('lumen-card--bordered')
    expect(card.classes()).toContain('lumen-card--shadow')
    expect(card.classes()).toContain('lumen-card--hoverable')
  })

  it('is bordered by default', () => {
    const wrapper = mount(Card)
    expect(wrapper.get('.lumen-card').classes()).toContain('lumen-card--bordered')
  })
})
