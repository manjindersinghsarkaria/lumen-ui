import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Radio, RadioGroup, type RadioGroupOption } from './index'

describe('Radio', () => {
  it('renders the label slot unchecked by default', () => {
    const wrapper = mount(Radio, {
      props: { value: 'a' },
      slots: { default: 'Option A' },
    })
    expect(wrapper.get('.lumen-radio__label').text()).toBe('Option A')
    expect((wrapper.get('input').element as HTMLInputElement).checked).toBe(false)
  })

  it('reflects the model when it matches the value', () => {
    const wrapper = mount(Radio, { props: { value: 'a', modelValue: 'a' } })
    expect((wrapper.get('input').element as HTMLInputElement).checked).toBe(true)
    expect(wrapper.get('.lumen-radio').classes()).toContain('lumen-radio--checked')
  })

  it('selects its value on click', async () => {
    const wrapper = mount(Radio, { props: { value: 'b', modelValue: 'a' } })
    await wrapper.get('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([['b']])
  })

  it('does not select when disabled', async () => {
    const wrapper = mount(Radio, { props: { value: 'b', modelValue: 'a', disabled: true } })
    await wrapper.get('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})

const OPTIONS: RadioGroupOption[] = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma', disabled: true },
]

describe('RadioGroup', () => {
  it('renders one radio per option with the model selected', () => {
    const wrapper = mount(RadioGroup, {
      props: { options: OPTIONS, modelValue: 'b', name: 'plan' },
    })
    const radios = wrapper.findAllComponents(Radio)
    expect(radios).toHaveLength(3)
    expect(radios[1].classes()).toContain('lumen-radio--checked')
    expect(wrapper.get('.lumen-radio-group').attributes('role')).toBe('radiogroup')
    const inputs = wrapper.findAll('input[type="radio"]')
    expect(inputs.every((i) => i.attributes('name') === 'plan')).toBe(true)
  })

  it('selects an option on click, emitting update and change', async () => {
    const wrapper = mount(RadioGroup, { props: { options: OPTIONS, modelValue: 'a' } })
    await wrapper.findAll('input[type="radio"]')[1].setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([['b']])
    expect(wrapper.emitted('change')).toEqual([['b']])
  })

  it('does not select a disabled option', async () => {
    const wrapper = mount(RadioGroup, { props: { options: OPTIONS, modelValue: 'a' } })
    await wrapper.findAll('input[type="radio"]')[2].setValue(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('applies the row direction class', () => {
    const wrapper = mount(RadioGroup, { props: { options: OPTIONS, direction: 'row' } })
    expect(wrapper.get('.lumen-radio-group').classes()).toContain('lumen-radio-group--row')
  })

  it('group disabled disables every radio', () => {
    const wrapper = mount(RadioGroup, { props: { options: OPTIONS, disabled: true } })
    const inputs = wrapper.findAll('input[type="radio"]')
    expect(inputs.every((i) => i.attributes('disabled') !== undefined)).toBe(true)
  })
})
