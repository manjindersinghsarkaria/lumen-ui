import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Table } from './index'
import type { TableColumn, TableRow } from './index'

const columns: TableColumn[] = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'age', title: 'Age', sortable: true, align: 'right', width: 80 },
  { key: 'city', title: 'City' },
]

const rows: TableRow[] = [
  { id: 1, name: 'Cara', age: 31, city: 'Oslo' },
  { id: 2, name: 'Ben', age: 24, city: 'Paris' },
  { id: 3, name: 'Ada', age: 28, city: 'Rome' },
]

function mountTable(props: Record<string, unknown> = {}) {
  return mount(Table, {
    props: { columns, rows, rowKey: 'id', ...props },
  })
}

function bodyTexts(wrapper: ReturnType<typeof mount>) {
  return wrapper
    .findAll('tbody tr')
    .map((tr) => tr.findAll('td').map((td) => td.text().trim()))
}

describe('Table', () => {
  it('renders headers and cell values', () => {
    const wrapper = mountTable()
    expect(wrapper.findAll('thead th').map((th) => th.text().replace(/[▲▼△]/g, '').trim())).toEqual([
      'Name',
      'Age',
      'City',
    ])
    const texts = bodyTexts(wrapper)
    expect(texts[0]).toEqual(['Cara', '31', 'Oslo'])
    expect(texts).toHaveLength(3)
  })

  it('applies column width and alignment styles', () => {
    const wrapper = mountTable()
    const ageTh = wrapper.findAll('thead th')[1]
    expect(ageTh.element.style.width).toBe('80px')
    expect(ageTh.element.style.textAlign).toBe('right')
  })

  it('sorts ascending, descending, then clears on repeated header clicks', async () => {
    const wrapper = mountTable()
    const nameTh = wrapper.findAll('thead th')[0]
    await nameTh.trigger('click')
    expect(bodyTexts(wrapper).map((r) => r[0])).toEqual(['Ada', 'Ben', 'Cara'])
    expect(wrapper.emitted('sort-change')).toEqual([['name', 'asc']])
    expect(nameTh.attributes('aria-sort')).toBe('ascending')
    await nameTh.trigger('click')
    expect(bodyTexts(wrapper).map((r) => r[0])).toEqual(['Cara', 'Ben', 'Ada'])
    expect(wrapper.emitted('sort-change')).toEqual([
      ['name', 'asc'],
      ['name', 'desc'],
    ])
    await nameTh.trigger('click')
    expect(bodyTexts(wrapper).map((r) => r[0])).toEqual(['Cara', 'Ben', 'Ada'])
    expect(wrapper.emitted('sort-change')![2]).toEqual([null, null])
  })

  it('sorts numbers numerically', async () => {
    const wrapper = mountTable()
    await wrapper.findAll('thead th')[1].trigger('click')
    expect(bodyTexts(wrapper).map((r) => r[1])).toEqual(['24', '28', '31'])
  })

  it('does not sort a non-sortable column', async () => {
    const wrapper = mountTable()
    await wrapper.findAll('thead th')[2].trigger('click')
    expect(wrapper.emitted('sort-change')).toBeUndefined()
    expect(bodyTexts(wrapper).map((r) => r[0])).toEqual(['Cara', 'Ben', 'Ada'])
  })

  it('selects rows and emits update:selected', async () => {
    const wrapper = mountTable({ selectable: true, selected: [] })
    const rowBoxes = wrapper.findAll('tbody input[type="checkbox"]')
    await rowBoxes[1].setValue(true)
    expect(wrapper.emitted('update:selected')).toEqual([[[2]]])
    const emitted = wrapper.emitted('selection-change')!
    expect(emitted[0][0]).toEqual([2])
    expect(emitted[0][1]).toEqual([rows[1]])
  })

  it('toggles all rows from the header checkbox', async () => {
    const wrapper = mountTable({ selectable: true, selected: [] })
    const headerBox = wrapper.get('thead input[type="checkbox"]')
    await headerBox.setValue(true)
    expect(wrapper.emitted('update:selected')).toEqual([[[1, 2, 3]]])
  })

  it('shows the empty state when there are no rows', () => {
    const wrapper = mountTable({ rows: [] })
    expect(wrapper.find('tbody tr td').text()).toBe('No data')
  })

  it('shows the loading state instead of rows', () => {
    const wrapper = mountTable({ loading: true, rows: [] })
    const cell = wrapper.get('tbody tr td')
    expect(cell.text()).toContain('Loading')
    expect(cell.find('.lumen-spinner').exists()).toBe(true)
  })

  it('applies striped and bordered classes', () => {
    const wrapper = mountTable({ striped: true, bordered: true })
    expect(wrapper.get('table').classes()).toContain('lumen-table--striped')
    expect(wrapper.get('.lumen-table__wrapper').classes()).toContain(
      'lumen-table__wrapper--bordered',
    )
  })

  it('renders a custom cell slot', () => {
    const wrapper = mount(Table, {
      props: { columns, rows, rowKey: 'id' },
      slots: { 'cell-name': '<template #default="{ row }"><b>{{ row.name }}</b></template>' },
    })
    expect(wrapper.find('tbody tr td b').text()).toBe('Cara')
  })
})
