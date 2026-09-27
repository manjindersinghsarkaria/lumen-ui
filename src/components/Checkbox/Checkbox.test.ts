import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Checkbox, CheckboxGroup, type CheckboxGroupOption } from './index'

describe('Checkbox', () => {
  it('renders the label slot unchecked by default', () => {
    const wrapper = mount(Checkbox, { slots: { default: 'Accept terms' } })
    expect(wrapper.get('.lumen-checkbox__label').text()).toBe('Accept terms')
    expect((wrapper.get('input').element as HTMLInputElement).checked).toBe(false)
    expect(wrapper.get('.lumen-checkbox').classes()).not.toContain('lumen-checkbox--checked')
  })

  it('renders the label prop', () => {
    const wrapper = mount(Checkbox, { props: { label: 'Remember me' } })
    expect(wrapper.get('.lumen-checkbox__label').text()).toBe('Remember me')
  })

  it('reflects a true v-model', () => {
    const wrapper = mount(Checkbox, { props: { modelValue: true } })
    expect((wrapper.get('input').element as HTMLInputElement).checked).toBe(true)
    expect(wrapper.get('.lumen-checkbox').classes()).toContain('lumen-checkbox--checked')
  })

  it('toggles on click', async () => {
    const wrapper = mount(Checkbox, { props: { modelValue: false } })
    await wrapper.get('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })

  it('does not toggle when disabled', async () => {
    const wrapper = mount(Checkbox, { props: { modelValue: false, disabled: true } })
    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
    await wrapper.get('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('sets the indeterminate property on the native input', async () => {
    const wrapper = mount(Checkbox, { props: { indeterminate: true } })
    expect((wrapper.get('input').element as HTMLInputElement).indeterminate).toBe(true)
    expect(wrapper.get('.lumen-checkbox').classes()).toContain('lumen-checkbox--indeterminate')
    await wrapper.setProps({ indeterminate: false })
    expect((wrapper.get('input').element as HTMLInputElement).indeterminate).toBe(false)
  })
})

const OPTIONS: CheckboxGroupOption[] = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma', disabled: true },
]

describe('CheckboxGroup', () => {
  it('renders one checkbox per option with the model checked', () => {
    const wrapper = mount(CheckboxGroup, { props: { options: OPTIONS, modelValue: ['a'] } })
    const boxes = wrapper.findAllComponents(Checkbox)
    expect(boxes).toHaveLength(3)
    expect(boxes[0].classes()).toContain('lumen-checkbox--checked')
    expect(boxes[1].classes()).not.toContain('lumen-checkbox--checked')
    expect(wrapper.get('.lumen-checkbox-group').attributes('role')).toBe('group')
  })

  it('toggles membership on click', async () => {
    const wrapper = mount(CheckboxGroup, { props: { options: OPTIONS, modelValue: ['a'] } })
    const boxes = wrapper.findAllComponents(Checkbox)
    await boxes[1].get('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([[['a', 'b']]])
    expect(wrapper.emitted('change')).toEqual([[['a', 'b']]])
  })

  it('does not toggle a disabled option', async () => {
    const wrapper = mount(CheckboxGroup, { props: { options: OPTIONS, modelValue: [] } })
    const boxes = wrapper.findAllComponents(Checkbox)
    await boxes[2].get('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('max prevents checking more options', async () => {
    const wrapper = mount(CheckboxGroup, {
      props: { options: OPTIONS, modelValue: ['a'], max: 1 },
    })
    const boxes = wrapper.findAllComponents(Checkbox)
    // 'b' is force-disabled at max, so no toggle happens
    await boxes[1].get('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    // unchecking 'a' still works
    await boxes[0].get('input').setValue(false)
    expect(wrapper.emitted('update:modelValue')).toEqual([[[]]])
  })

  it('min prevents unchecking below the minimum', async () => {
    const wrapper = mount(CheckboxGroup, {
      props: { options: OPTIONS, modelValue: ['a'], min: 1 },
    })
    const boxes = wrapper.findAllComponents(Checkbox)
    await boxes[0].get('input').setValue(false)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('group disabled disables every checkbox', () => {
    const wrapper = mount(CheckboxGroup, {
      props: { options: OPTIONS, modelValue: [], disabled: true },
    })
    const inputs = wrapper.findAll('input')
    expect(inputs.every((i) => i.attributes('disabled') !== undefined)).toBe(true)
  })
})
