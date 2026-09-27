import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { Select, type SelectOption } from './index'

const OPTIONS: SelectOption[] = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana', disabled: true },
  { value: 'c', label: 'Cherry' },
]

function openSelect(wrapper: ReturnType<typeof mount>) {
  return wrapper.get('[role="combobox"]').trigger('click')
}

describe('Select', () => {
  it('shows the i18n placeholder when nothing is selected', () => {
    const wrapper = mount(Select, { props: { options: OPTIONS } })
    expect(wrapper.get('.lumen-select__value').text()).toBe('Select an option')
  })

  it('supports a custom placeholder', () => {
    const wrapper = mount(Select, { props: { options: OPTIONS, placeholder: 'Pick one' } })
    expect(wrapper.get('.lumen-select__value').text()).toBe('Pick one')
  })

  it('shows the selected option label for the v-model value', () => {
    const wrapper = mount(Select, { props: { options: OPTIONS, modelValue: 'c' } })
    expect(wrapper.get('.lumen-select__value').text()).toBe('Cherry')
  })

  it('opens on trigger click and lists options', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS } })
    expect(wrapper.find('.lumen-select__panel').exists()).toBe(false)
    await openSelect(wrapper)
    const items = wrapper.findAll('.lumen-select__option')
    expect(items).toHaveLength(3)
    expect(items[1].classes()).toContain('lumen-select__option--disabled')
    expect(wrapper.get('[role="combobox"]').attributes('aria-expanded')).toBe('true')
  })

  it('selects an option on click, emitting update and change', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS } })
    await openSelect(wrapper)
    await wrapper.findAll('.lumen-select__option')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([['c']])
    expect(wrapper.emitted('change')).toEqual([['c']])
    expect(wrapper.find('.lumen-select__panel').exists()).toBe(false)
  })

  it('does not select a disabled option', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS } })
    await openSelect(wrapper)
    await wrapper.findAll('.lumen-select__option')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.find('.lumen-select__panel').exists()).toBe(true)
  })

  it('clearable resets the value', async () => {
    const wrapper = mount(Select, {
      props: { options: OPTIONS, modelValue: 'a', clearable: true },
    })
    await wrapper.get('.lumen-select__clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[null]])
    expect(wrapper.emitted('change')).toEqual([[null]])
  })

  it('hides the clear button without a value', () => {
    const wrapper = mount(Select, { props: { options: OPTIONS, clearable: true } })
    expect(wrapper.find('.lumen-select__clear').exists()).toBe(false)
  })

  it('does not open when disabled', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS, disabled: true } })
    await openSelect(wrapper)
    expect(wrapper.find('.lumen-select__panel').exists()).toBe(false)
  })

  it('searchable filters options and shows the empty state', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS, searchable: true } })
    await openSelect(wrapper)
    const search = wrapper.get('.lumen-select__search')
    expect(search.attributes('placeholder')).toBe('Search options')
    await search.setValue('cher')
    expect(wrapper.findAll('.lumen-select__option')).toHaveLength(1)
    await search.setValue('zzz')
    expect(wrapper.findAll('.lumen-select__option')).toHaveLength(0)
    expect(wrapper.get('.lumen-select__empty').text()).toBe('No options found')
  })

  it('keyboard: Enter opens, arrows move (skipping disabled), Enter selects, Escape closes', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS } })
    const trigger = wrapper.get('[role="combobox"]')
    await trigger.trigger('keydown', { key: 'Enter' })
    expect(wrapper.find('.lumen-select__panel').exists()).toBe(true)
    // active starts at 'a' (index 0); ArrowDown skips disabled 'b' → 'c'
    await wrapper.get('.lumen-select').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.get('.lumen-select').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toEqual([['c']])
  })

  it('keyboard: Escape closes the panel', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS } })
    await openSelect(wrapper)
    expect(wrapper.find('.lumen-select__panel').exists()).toBe(true)
    await wrapper.get('.lumen-select').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.lumen-select__panel').exists()).toBe(false)
  })

  it('closes on outside pointerdown', async () => {
    const wrapper = mount(Select, { props: { options: OPTIONS } })
    await openSelect(wrapper)
    expect(wrapper.find('.lumen-select__panel').exists()).toBe(true)
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(wrapper.find('.lumen-select__panel').exists()).toBe(false)
  })

  it('renders the error message', () => {
    const wrapper = mount(Select, { props: { options: OPTIONS, error: 'Required' } })
    expect(wrapper.get('.lumen-select__error').text()).toBe('Required')
    expect(wrapper.get('.lumen-select').classes()).toContain('lumen-select--error')
  })

  it('applies size classes', () => {
    const wrapper = mount(Select, { props: { options: OPTIONS, size: 'sm' } })
    expect(wrapper.get('.lumen-select').classes()).toContain('lumen-select--sm')
  })
})
