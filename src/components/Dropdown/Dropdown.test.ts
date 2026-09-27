import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { Dropdown } from './index'
import type { DropdownItem } from './Dropdown.vue'

const items: DropdownItem[] = [
  { label: 'Edit', value: 'edit' },
  { label: 'Duplicate', value: 'duplicate' },
  { label: 'Delete', value: 'delete', danger: true, divided: true },
  { label: 'Archived', value: 'archived', disabled: true },
]

function openDropdown(props: Record<string, unknown> = {}) {
  return mount(Dropdown, {
    props: { items, ...props },
    slots: { default: 'Open menu' },
    attachTo: document.body,
  })
}

describe('Dropdown', () => {
  it('renders the trigger and hides the menu initially', () => {
    const wrapper = openDropdown()
    expect(wrapper.get('.lumen-dropdown__trigger').text()).toBe('Open menu')
    expect(wrapper.find('.lumen-dropdown__menu').exists()).toBe(false)
    expect(wrapper.get('.lumen-dropdown__trigger').attributes('aria-haspopup')).toBe('menu')
    wrapper.unmount()
  })

  it('opens on trigger click and renders items', async () => {
    const wrapper = openDropdown()
    await wrapper.get('.lumen-dropdown__trigger').trigger('click')
    const menuItems = wrapper.findAll('.lumen-dropdown__item')
    expect(menuItems).toHaveLength(4)
    expect(menuItems[0].text()).toBe('Edit')
    expect(menuItems[0].attributes('role')).toBe('menuitem')
    wrapper.unmount()
  })

  it('supports v-model:open', async () => {
    const wrapper = openDropdown({ open: true })
    expect(wrapper.find('.lumen-dropdown__menu').exists()).toBe(true)
    await wrapper.setProps({ open: false })
    expect(wrapper.find('.lumen-dropdown__menu').exists()).toBe(false)
    wrapper.unmount()
  })

  it('emits select with the item and index, calls onSelect, and closes', async () => {
    const onSelect = vi.fn()
    const customItems: DropdownItem[] = [{ label: 'Go', value: 'go', onSelect }]
    const wrapper = mount(Dropdown, {
      props: { items: customItems },
      slots: { default: 'trigger' },
    })
    await wrapper.get('.lumen-dropdown__trigger').trigger('click')
    await wrapper.get('.lumen-dropdown__item').trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('select')![0]).toEqual([customItems[0], 0])
    expect(onSelect).toHaveBeenCalledWith(customItems[0])
    expect(wrapper.find('.lumen-dropdown__menu').exists()).toBe(false)
  })

  it('does not select disabled items', async () => {
    const wrapper = openDropdown()
    await wrapper.get('.lumen-dropdown__trigger').trigger('click')
    const disabled = wrapper.findAll('.lumen-dropdown__item')[3]
    expect(disabled.attributes('disabled')).toBeDefined()
    await disabled.trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(wrapper.find('.lumen-dropdown__menu').exists()).toBe(true)
    wrapper.unmount()
  })

  it('renders dividers and danger styling', async () => {
    const wrapper = openDropdown()
    await wrapper.get('.lumen-dropdown__trigger').trigger('click')
    expect(wrapper.findAll('.lumen-dropdown__divider')).toHaveLength(1)
    expect(wrapper.findAll('.lumen-dropdown__item')[2].classes()).toContain(
      'lumen-dropdown__item--danger',
    )
    wrapper.unmount()
  })

  it('applies placement classes', async () => {
    const wrapper = openDropdown({ placement: 'top-end', open: true })
    expect(wrapper.get('.lumen-dropdown__menu').classes()).toContain(
      'lumen-dropdown__menu--top-end',
    )
    wrapper.unmount()
  })

  it('closes on Escape and on outside click', async () => {
    const wrapper = openDropdown()
    await wrapper.get('.lumen-dropdown__trigger').trigger('click')
    expect(wrapper.find('.lumen-dropdown__menu').exists()).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(wrapper.find('.lumen-dropdown__menu').exists()).toBe(false)

    await wrapper.get('.lumen-dropdown__trigger').trigger('click')
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(wrapper.find('.lumen-dropdown__menu').exists()).toBe(false)
    wrapper.unmount()
  })

  it('opens with ArrowDown and moves focus with arrow keys, skipping disabled items', async () => {
    const wrapper = openDropdown()
    const trigger = wrapper.get('.lumen-dropdown__trigger')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    const menuItems = wrapper.findAll('.lumen-dropdown__item')
    expect(document.activeElement).toBe(menuItems[0].element)

    await wrapper.get('.lumen-dropdown__menu').trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(menuItems[1].element)
    // skips the disabled item at index 3, wraps to index 0... first goes to Delete (2)
    await wrapper.get('.lumen-dropdown__menu').trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(menuItems[2].element)
    await wrapper.get('.lumen-dropdown__menu').trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(menuItems[0].element)
    wrapper.unmount()
  })

  it('selects the focused item with Enter', async () => {
    const wrapper = openDropdown()
    await wrapper.get('.lumen-dropdown__trigger').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    await wrapper.get('.lumen-dropdown__menu').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')![0]).toEqual([items[0], 0])
    expect(wrapper.find('.lumen-dropdown__menu').exists()).toBe(false)
    wrapper.unmount()
  })

  it('does not open when disabled', async () => {
    const wrapper = openDropdown({ disabled: true })
    await wrapper.get('.lumen-dropdown__trigger').trigger('click')
    expect(wrapper.find('.lumen-dropdown__menu').exists()).toBe(false)
    wrapper.unmount()
  })

  it('renders the item-icon slot and empty state', async () => {
    const wrapper = mount(Dropdown, {
      props: { items: [{ label: 'Starred', icon: 'star' }] },
      slots: {
        default: 'trigger',
        'item-icon': '<span class="custom-icon">★</span>',
      },
    })
    await wrapper.get('.lumen-dropdown__trigger').trigger('click')
    expect(wrapper.get('.custom-icon').text()).toBe('★')

    const empty = mount(Dropdown, { props: { items: [] }, slots: { default: 't', empty: 'Nothing here' } })
    await empty.get('.lumen-dropdown__trigger').trigger('click')
    expect(empty.get('.lumen-dropdown__empty').text()).toBe('Nothing here')
  })
})
