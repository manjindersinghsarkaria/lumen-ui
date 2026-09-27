import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Spinner } from './index'

describe('Spinner', () => {
  it('renders an inline ring with status role and default label', () => {
    const wrapper = mount(Spinner)
    const root = wrapper.get('.lumen-spinner')
    expect(root.attributes('role')).toBe('status')
    expect(root.attributes('aria-label')).toBe('Loading')
    expect(wrapper.find('.lumen-spinner__overlay').exists()).toBe(false)
  })

  it('maps named sizes to pixel diameters', () => {
    const sm = mount(Spinner, { props: { size: 'sm' } })
    expect(sm.get('.lumen-spinner__ring').element.style.width).toBe('16px')
    const md = mount(Spinner, { props: { size: 'md' } })
    expect(md.get('.lumen-spinner__ring').element.style.width).toBe('24px')
    const lg = mount(Spinner, { props: { size: 'lg' } })
    expect(lg.get('.lumen-spinner__ring').element.style.width).toBe('32px')
  })

  it('accepts a numeric size', () => {
    const wrapper = mount(Spinner, { props: { size: 48 } })
    const ring = wrapper.get('.lumen-spinner__ring').element.style
    expect(ring.width).toBe('48px')
    expect(ring.height).toBe('48px')
  })

  it('renders tip text when provided', () => {
    const withTip = mount(Spinner, { props: { tip: 'Fetching data…' } })
    expect(withTip.get('.lumen-spinner__tip').text()).toBe('Fetching data…')
    const withoutTip = mount(Spinner)
    expect(withoutTip.find('.lumen-spinner__tip').exists()).toBe(false)
  })

  it('uses a custom aria-label when provided', () => {
    const wrapper = mount(Spinner, { props: { ariaLabel: 'Saving document' } })
    expect(wrapper.get('.lumen-spinner').attributes('aria-label')).toBe('Saving document')
  })

  it('renders a fullscreen overlay teleported to body', () => {
    const wrapper = mount(Spinner, { props: { fullscreen: true, tip: 'Loading app' } })
    const overlay = document.body.querySelector('.lumen-spinner__overlay')
    expect(overlay).not.toBeNull()
    expect(overlay!.getAttribute('role')).toBe('status')
    expect(overlay!.querySelector('.lumen-spinner__tip')!.textContent).toBe('Loading app')
    // no inline root when fullscreen
    expect(wrapper.find('.lumen-spinner').exists()).toBe(false)
    wrapper.unmount()
    expect(document.body.querySelector('.lumen-spinner__overlay')).toBeNull()
  })
})
