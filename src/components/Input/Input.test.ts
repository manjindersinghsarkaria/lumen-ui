import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Input } from './index'

describe('Input', () => {
  it('renders the model value', () => {
    const wrapper = mount(Input, { props: { modelValue: 'hello' } })
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('hello')
  })

  it('updates the model on user input', async () => {
    const wrapper = mount(Input, { props: { modelValue: '' } })
    await wrapper.get('input').setValue('world')
    expect(wrapper.emitted('update:modelValue')).toEqual([['world']])
  })

  it('respects the type prop', () => {
    const wrapper = mount(Input, { props: { type: 'password' } })
    expect(wrapper.get('input').attributes('type')).toBe('password')
  })

  it('applies size classes', () => {
    const wrapper = mount(Input, { props: { size: 'lg' } })
    expect(wrapper.get('.lumen-input').classes()).toContain('lumen-input--lg')
  })

  it('passes placeholder through', () => {
    const wrapper = mount(Input, { props: { placeholder: 'Type here' } })
    expect(wrapper.get('input').attributes('placeholder')).toBe('Type here')
  })

  it('disables the field', () => {
    const wrapper = mount(Input, { props: { disabled: true } })
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
    expect(wrapper.get('.lumen-input').classes()).toContain('lumen-input--disabled')
  })

  it('shows the clear button only when clearable and non-empty', async () => {
    const wrapper = mount(Input, { props: { modelValue: '', clearable: true } })
    expect(wrapper.find('.lumen-input__clear').exists()).toBe(false)
    await wrapper.setProps({ modelValue: 'text' })
    expect(wrapper.find('.lumen-input__clear').exists()).toBe(true)
  })

  it('clear button resets the model and emits clear', async () => {
    const wrapper = mount(Input, { props: { modelValue: 'text', clearable: true } })
    const clearBtn = wrapper.get('.lumen-input__clear')
    expect(clearBtn.attributes('aria-label')).toBe('Clear input')
    await clearBtn.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['']])
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })

  it('hides the clear button when disabled', () => {
    const wrapper = mount(Input, {
      props: { modelValue: 'text', clearable: true, disabled: true },
    })
    expect(wrapper.find('.lumen-input__clear').exists()).toBe(false)
  })

  it('renders the error message with error styling and a11y hooks', () => {
    const wrapper = mount(Input, { props: { error: 'Required field' } })
    const error = wrapper.get('.lumen-input__error')
    expect(error.text()).toBe('Required field')
    expect(error.attributes('role')).toBe('alert')
    expect(wrapper.get('.lumen-input').classes()).toContain('lumen-input--error')
    const input = wrapper.get('input')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe(error.attributes('id'))
  })

  it('renders prefix and suffix slots', () => {
    const wrapper = mount(Input, {
      slots: { prefix: '<span class="pre">$</span>', suffix: '<span class="suf">.00</span>' },
    })
    expect(wrapper.get('.lumen-input__prefix .pre').exists()).toBe(true)
    expect(wrapper.get('.lumen-input__suffix .suf').exists()).toBe(true)
  })

  it('emits focus and blur', async () => {
    const wrapper = mount(Input)
    const input = wrapper.get('input')
    await input.trigger('focus')
    await input.trigger('blur')
    expect(wrapper.emitted('focus')).toHaveLength(1)
    expect(wrapper.emitted('blur')).toHaveLength(1)
  })
})
