import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Progress } from './index'

describe('Progress', () => {
  it('renders a bar by default with progressbar semantics', () => {
    const wrapper = mount(Progress, { props: { percent: 35 } })
    const root = wrapper.get('.lumen-progress')
    expect(root.attributes('role')).toBe('progressbar')
    expect(root.attributes('aria-valuenow')).toBe('35')
    expect(root.attributes('aria-valuemin')).toBe('0')
    expect(root.attributes('aria-valuemax')).toBe('100')
    expect(wrapper.get('.lumen-progress__fill').attributes('style')).toContain('width: 35%')
    expect(wrapper.get('.lumen-progress__info').text()).toBe('35%')
  })

  it('clamps percent above 100 and below 0', () => {
    const over = mount(Progress, { props: { percent: 150 } })
    expect(over.get('.lumen-progress').attributes('aria-valuenow')).toBe('100')
    expect(over.get('.lumen-progress__fill').attributes('style')).toContain('width: 100%')
    const under = mount(Progress, { props: { percent: -20 } })
    expect(under.get('.lumen-progress').attributes('aria-valuenow')).toBe('0')
    expect(under.get('.lumen-progress__fill').attributes('style')).toContain('width: 0%')
  })

  it('treats non-finite percent as 0', () => {
    const wrapper = mount(Progress, { props: { percent: Number.NaN } })
    expect(wrapper.get('.lumen-progress').attributes('aria-valuenow')).toBe('0')
  })

  it('applies the status class to the root', () => {
    const wrapper = mount(Progress, { props: { percent: 100, status: 'success' } })
    expect(wrapper.get('.lumen-progress').classes()).toContain('lumen-progress--success')
    const bad = mount(Progress, { props: { percent: 10, status: 'exception' } })
    expect(bad.get('.lumen-progress').classes()).toContain('lumen-progress--exception')
  })

  it('hides the info text when showInfo is false', () => {
    const wrapper = mount(Progress, { props: { percent: 40, showInfo: false } })
    expect(wrapper.find('.lumen-progress__info').exists()).toBe(false)
  })

  it('uses a custom format function for the info text', () => {
    const wrapper = mount(Progress, {
      props: { percent: 40, format: (p: number) => `${p} of 100 done` },
    })
    expect(wrapper.get('.lumen-progress__info').text()).toBe('40 of 100 done')
  })

  it('applies a color override to the fill', () => {
    const wrapper = mount(Progress, { props: { percent: 50, color: '#ff0000' } })
    expect(wrapper.get('.lumen-progress__fill').element.style.backgroundColor).toBe(
      'rgb(255, 0, 0)',
    )
  })

  it('uses strokeWidth as the bar track height', () => {
    const wrapper = mount(Progress, { props: { percent: 50, strokeWidth: 12 } })
    expect(wrapper.get('.lumen-progress__track').element.style.height).toBe('12px')
  })

  it('renders a circle with correct dash geometry', () => {
    const wrapper = mount(Progress, { props: { percent: 50, type: 'circle' } })
    const fill = wrapper.get('.lumen-progress__circle-fill')
    const r = (120 - 6) / 2
    const expected = 2 * Math.PI * r
    expect(parseFloat(fill.attributes('stroke-dasharray')!)).toBeCloseTo(expected, 5)
    expect(parseFloat(fill.attributes('stroke-dashoffset')!)).toBeCloseTo(expected / 2, 5)
    expect(wrapper.get('.lumen-progress__circle-info').text()).toBe('50%')
  })

  it('respects circle size and strokeWidth props', () => {
    const wrapper = mount(Progress, {
      props: { percent: 25, type: 'circle', size: 160, strokeWidth: 10 },
    })
    const wrap = wrapper.get('.lumen-progress__circle-wrap')
    expect(wrap.element.style.width).toBe('160px')
    const fill = wrapper.get('.lumen-progress__circle-fill')
    const r = (160 - 10) / 2
    expect(parseFloat(fill.attributes('stroke-dasharray')!)).toBeCloseTo(2 * Math.PI * r, 5)
  })

  it('forwards an aria-label', () => {
    const wrapper = mount(Progress, { props: { percent: 10, ariaLabel: 'Upload progress' } })
    expect(wrapper.get('.lumen-progress').attributes('aria-label')).toBe('Upload progress')
  })
})
