import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Breadcrumb } from './index'
import type { BreadcrumbItem } from './index'

const items: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Library', href: '/library' },
  { label: 'Data' },
]

describe('Breadcrumb', () => {
  it('renders links for items with href and current page for the last', () => {
    const wrapper = mount(Breadcrumb, { props: { items } })
    const links = wrapper.findAll('.lumen-breadcrumb__link')
    expect(links.map((l) => l.text())).toEqual(['Home', 'Library'])
    expect(links[0].attributes('href')).toBe('/')
    const current = wrapper.get('.lumen-breadcrumb__current')
    expect(current.text()).toBe('Data')
    expect(current.attributes('aria-current')).toBe('page')
    expect(wrapper.get('nav').attributes('aria-label')).toBe('Breadcrumb')
  })

  it('renders an item without href as plain text', () => {
    const wrapper = mount(Breadcrumb, {
      props: { items: [{ label: 'Home', href: '/' }, { label: 'Plain' }] },
    })
    expect(wrapper.findAll('.lumen-breadcrumb__link')).toHaveLength(1)
  })

  it('uses the separator prop between items', () => {
    const wrapper = mount(Breadcrumb, { props: { items, separator: '›' } })
    const seps = wrapper.findAll('.lumen-breadcrumb__separator')
    expect(seps).toHaveLength(2)
    expect(seps[0].text()).toBe('›')
  })

  it('lets the separator slot override the prop', () => {
    const wrapper = mount(Breadcrumb, {
      props: { items, separator: '/' },
      slots: { separator: '→' },
    })
    expect(wrapper.findAll('.lumen-breadcrumb__separator')[0].text()).toBe('→')
  })

  it('collapses the middle items when over maxItems', () => {
    const many: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'A', href: '/a' },
      { label: 'B', href: '/b' },
      { label: 'C', href: '/c' },
      { label: 'D', href: '/d' },
      { label: 'Current' },
    ]
    const wrapper = mount(Breadcrumb, { props: { items: many, maxItems: 4 } })
    const ellipsis = wrapper.findAll('.lumen-breadcrumb__ellipsis')
    expect(ellipsis).toHaveLength(1)
    // first + last (maxItems - 1) stay visible
    expect(wrapper.findAll('.lumen-breadcrumb__entry').length).toBe(5)
    expect(wrapper.findAll('.lumen-breadcrumb__link').map((l) => l.text())).toEqual([
      'Home',
      'C',
      'D',
    ])
    expect(wrapper.get('.lumen-breadcrumb__current').text()).toBe('Current')
  })

  it('does not collapse when maxItems is large enough', () => {
    const wrapper = mount(Breadcrumb, { props: { items, maxItems: 5 } })
    expect(wrapper.find('.lumen-breadcrumb__ellipsis').exists()).toBe(false)
    expect(wrapper.findAll('.lumen-breadcrumb__entry')).toHaveLength(3)
  })

  it('renders item icons and the item-icon slot', () => {
    const withIcon = mount(Breadcrumb, {
      props: { items: [{ label: 'Home', href: '/', icon: '⌂' }] },
    })
    expect(withIcon.get('.lumen-breadcrumb__icon').text()).toBe('⌂')
    const withSlot = mount(Breadcrumb, {
      props: { items },
      slots: { 'item-icon': '<template #default>★</template>' },
    })
    expect(withSlot.get('.lumen-breadcrumb__icon').text()).toBe('★')
  })

  it('uses a custom aria-label', () => {
    const wrapper = mount(Breadcrumb, { props: { items, ariaLabel: 'Trail' } })
    expect(wrapper.get('nav').attributes('aria-label')).toBe('Trail')
  })
})
