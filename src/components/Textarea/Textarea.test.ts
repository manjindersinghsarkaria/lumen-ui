import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Textarea } from './index'
import { calcAutosizeHeight } from './autosize'

describe('calcAutosizeHeight', () => {
  it('returns scrollHeight when within min/max rows', () => {
    expect(calcAutosizeHeight(60, 20, 2, 5)).toBe(60)
  })

  it('clamps up to minRows', () => {
    expect(calcAutosizeHeight(10, 20, 2, 5)).toBe(40)
  })

  it('clamps down to maxRows', () => {
    expect(calcAutosizeHeight(500, 20, 2, 5)).toBe(100)
  })

  it('works without min/max', () => {
    expect(calcAutosizeHeight(77, 20)).toBe(77)
  })
})

describe('Textarea', () => {
  it('renders the model value with default rows', () => {
    const wrapper = mount(Textarea, { props: { modelValue: 'hello' } })
    const ta = wrapper.get('textarea')
    expect((ta.element as HTMLTextAreaElement).value).toBe('hello')
    expect(ta.attributes('rows')).toBe('3')
  })

  it('updates the model on user input', async () => {
    const wrapper = mount(Textarea, { props: { modelValue: '' } })
    await wrapper.get('textarea').setValue('multi\nline')
    expect(wrapper.emitted('update:modelValue')).toEqual([['multi\nline']])
  })

  it('applies size classes and placeholder', () => {
    const wrapper = mount(Textarea, { props: { size: 'lg', placeholder: 'Write…' } })
    const ta = wrapper.get('textarea')
    expect(ta.classes()).toContain('lumen-textarea--lg')
    expect(ta.attributes('placeholder')).toBe('Write…')
  })

  it('disables the field', () => {
    const wrapper = mount(Textarea, { props: { disabled: true } })
    expect(wrapper.get('textarea').attributes('disabled')).toBeDefined()
  })

  it('passes maxlength through', () => {
    const wrapper = mount(Textarea, { props: { maxlength: 100 } })
    expect(wrapper.get('textarea').attributes('maxlength')).toBe('100')
  })

  it('shows an i18n character counter when maxlength is set', () => {
    const wrapper = mount(Textarea, { props: { modelValue: 'hi', maxlength: 10 } })
    expect(wrapper.get('.lumen-textarea__count').text()).toBe('2 / 10 characters')
  })

  it('hides the counter without maxlength', () => {
    const wrapper = mount(Textarea, { props: { modelValue: 'hi' } })
    expect(wrapper.find('.lumen-textarea__count').exists()).toBe(false)
  })

  it('renders the error state with a11y hooks', () => {
    const wrapper = mount(Textarea, { props: { error: 'Too short' } })
    const error = wrapper.get('.lumen-textarea__error')
    expect(error.text()).toBe('Too short')
    expect(error.attributes('role')).toBe('alert')
    expect(wrapper.get('textarea').classes()).toContain('lumen-textarea--error')
    expect(wrapper.get('textarea').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('textarea').attributes('aria-describedby')).toBe(error.attributes('id'))
  })

  it('autosize sets the height from scrollHeight on input', async () => {
    const wrapper = mount(Textarea, { props: { autosize: true, modelValue: '' } })
    const ta = wrapper.get('textarea')
    Object.defineProperty(ta.element, 'scrollHeight', { value: 120, configurable: true })
    await ta.setValue('line1\nline2')
    expect((ta.element as HTMLTextAreaElement).style.height).toBe('120px')
  })

  it('autosize accepts a min/max rows object', async () => {
    const wrapper = mount(Textarea, {
      props: { autosize: { minRows: 2, maxRows: 4 }, modelValue: '' },
    })
    const ta = wrapper.get('textarea')
    Object.defineProperty(ta.element, 'scrollHeight', { value: 500, configurable: true })
    await ta.setValue('x')
    // clamped by maxRows (jsdom line-height fallback 20px → 4 * 20 = 80px)
    expect((ta.element as HTMLTextAreaElement).style.height).toBe('80px')
  })

  it('emits focus and blur', async () => {
    const wrapper = mount(Textarea)
    const ta = wrapper.get('textarea')
    await ta.trigger('focus')
    await ta.trigger('blur')
    expect(wrapper.emitted('focus')).toHaveLength(1)
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })
})
