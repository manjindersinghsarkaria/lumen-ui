import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Pagination } from './index'

function pageButtons(wrapper: ReturnType<typeof mount>) {
  return wrapper
    .findAll('.lumen-pagination__btn')
    .filter((b) => b.attributes('aria-label')?.startsWith('Go to page'))
}

describe('Pagination', () => {
  it('renders all page buttons when there are 7 or fewer pages', () => {
    const wrapper = mount(Pagination, { props: { total: 60 } })
    expect(pageButtons(wrapper).map((b) => b.text())).toEqual([
      '1', '2', '3', '4', '5', '6',
    ])
    expect(wrapper.get('nav').attributes('aria-label')).toBe('Pagination')
  })

  it('collapses to first, window and last with ellipsis for many pages', () => {
    const wrapper = mount(Pagination, { props: { total: 95 } }) // 10 pages, on page 1
    expect(pageButtons(wrapper).map((b) => b.text())).toEqual(['1', '2', '10'])
    expect(wrapper.findAll('.lumen-pagination__ellipsis').length).toBe(1)
  })

  it('marks the current page with aria-current', () => {
    const wrapper = mount(Pagination, { props: { total: 50, page: 3 } })
    const active = wrapper.get('.lumen-pagination__btn--active')
    expect(active.text()).toBe('3')
    expect(active.attributes('aria-current')).toBe('page')
  })

  it('emits update:page and change when a page is clicked', () => {
    const wrapper = mount(Pagination, { props: { total: 50, page: 1 } })
    pageButtons(wrapper)[2].trigger('click')
    expect(wrapper.emitted('update:page')).toEqual([[3]])
    expect(wrapper.emitted('change')).toEqual([[3, 10]])
  })

  it('disables prev on the first page and next on the last', () => {
    const first = mount(Pagination, { props: { total: 50, page: 1 } })
    const btns = first.findAll('.lumen-pagination__btn')
    expect(btns[0].attributes('disabled')).toBeDefined()
    expect(btns[btns.length - 1].attributes('disabled')).toBeUndefined()
    const last = mount(Pagination, { props: { total: 50, page: 5 } })
    const lastBtns = last.findAll('.lumen-pagination__btn')
    expect(lastBtns[lastBtns.length - 1].attributes('disabled')).toBeDefined()
  })

  it('navigates with prev/next buttons', () => {
    const wrapper = mount(Pagination, { props: { total: 50, page: 2 } })
    const btns = wrapper.findAll('.lumen-pagination__btn')
    btns[0].trigger('click')
    btns[btns.length - 1].trigger('click')
    expect(wrapper.emitted('update:page')).toEqual([[1], [3]])
  })

  it('collapses long ranges with ellipsis', () => {
    const wrapper = mount(Pagination, { props: { total: 200, page: 10 } })
    const ellipsis = wrapper.findAll('.lumen-pagination__ellipsis')
    expect(ellipsis.length).toBe(2)
    // first, last and the window around 10 stay visible
    const labels = pageButtons(wrapper).map((b) => b.text())
    expect(labels).toContain('1')
    expect(labels).toContain('20')
    expect(labels).toContain('10')
  })

  it('resets to page 1 when the page size changes', () => {
    const wrapper = mount(Pagination, { props: { total: 100, page: 5 } })
    const select = wrapper.get('.lumen-pagination__sizes select')
    select.setValue('20')
    expect(wrapper.emitted('update:pageSize')).toEqual([[20]])
    expect(wrapper.emitted('update:page')).toEqual([[1]])
    expect(wrapper.emitted('change')).toEqual([[1, 20]])
  })

  it('jumps to the entered page clamped to range', async () => {
    const wrapper = mount(Pagination, { props: { total: 100, showJumper: true } })
    const input = wrapper.get('.lumen-pagination__jumper input')
    await input.setValue('7')
    await wrapper.get('.lumen-pagination__jumper').trigger('submit')
    expect(wrapper.emitted('update:page')).toEqual([[7]])
  })

  it('ignores invalid jumper input', async () => {
    const wrapper = mount(Pagination, { props: { total: 100, showJumper: true } })
    const input = wrapper.get('.lumen-pagination__jumper input')
    await input.setValue('abc')
    await wrapper.get('.lumen-pagination__jumper').trigger('submit')
    expect(wrapper.emitted('update:page')).toBeUndefined()
  })

  it('disables every control when disabled', () => {
    const wrapper = mount(Pagination, {
      props: { total: 100, disabled: true, showJumper: true },
    })
    const enabled = wrapper
      .findAll('button, select, input')
      .filter((el) => el.attributes('disabled') === undefined)
    expect(enabled.length).toBe(0)
  })
})
