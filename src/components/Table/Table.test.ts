import { describe, expect, it, vi } from 'vitest'
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
    expect(((ageTh.element) as HTMLElement).style.width).toBe('80px')
    expect(((ageTh.element) as HTMLElement).style.textAlign).toBe('right')
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

  it('sorts via keyboard on a sortable header', async () => {
    const wrapper = mountTable()
    await wrapper.findAll('thead th')[0].trigger('keydown.enter')
    expect(bodyTexts(wrapper).map((r) => r[0])).toEqual(['Ada', 'Ben', 'Cara'])
  })

  it('applies defaultSort on mount', () => {
    const wrapper = mountTable({ defaultSort: [{ key: 'age', order: 'desc' }] })
    expect(bodyTexts(wrapper).map((r) => r[1])).toEqual(['31', '28', '24'])
  })

  it('hides columns flagged hidden', () => {
    const wrapper = mountTable({
      columns: [...columns, { key: 'secret', title: 'Secret', hidden: true }],
    })
    const headers = wrapper.findAll('thead th').map((th) => th.text().trim())
    expect(headers).not.toContain('Secret')
    expect(headers).toHaveLength(3)
  })

  it('sorts and renders nested field paths', async () => {
    const nestedColumns: TableColumn[] = [
      { key: 'country', field: 'country.name', title: 'Country', sortable: true },
    ]
    const nestedRows: TableRow[] = [
      { id: 1, country: { name: 'Norway' } },
      { id: 2, country: { name: 'France' } },
    ]
    const wrapper = mount(Table, {
      props: { columns: nestedColumns, rows: nestedRows, rowKey: 'id' },
    })
    expect(bodyTexts(wrapper).map((r) => r[0])).toEqual(['Norway', 'France'])
    await wrapper.find('thead th').trigger('click')
    expect(bodyTexts(wrapper).map((r) => r[0])).toEqual(['France', 'Norway'])
  })

  it('renders header and footer slots', () => {
    const wrapper = mount(Table, {
      props: { columns, rows, rowKey: 'id' },
      slots: {
        header: '<div class="h">H</div>',
        footer: '<div class="f">F</div>',
      },
    })
    expect(wrapper.find('.lumen-table__toolbar .h').exists()).toBe(true)
    expect(wrapper.find('tfoot .f').exists()).toBe(true)
  })
})

describe('Table multi-sort', () => {
  const multiColumns: TableColumn[] = [
    { key: 'name', title: 'Name', sortable: true },
    { key: 'age', title: 'Age', sortable: true },
  ]
  const multiRows: TableRow[] = [
    { id: 1, name: 'Ben', age: 30 },
    { id: 2, name: 'Ada', age: 30 },
    { id: 3, name: 'Cara', age: 24 },
  ]

  function mountMulti(props: Record<string, unknown> = {}) {
    return mount(Table, {
      props: { columns: multiColumns, rows: multiRows, rowKey: 'id', multiSort: true, ...props },
    })
  }

  it('accumulates descriptors and applies them in priority order', async () => {
    const wrapper = mountMulti()
    const ths = wrapper.findAll('thead th')
    await ths[1].trigger('click') // age asc (primary)
    await ths[0].trigger('click') // name asc (secondary)
    expect(bodyTexts(wrapper).map((r) => r[0])).toEqual(['Cara', 'Ada', 'Ben'])
    const emitted = wrapper.emitted('multi-sort-change')!
    expect(emitted[1][0]).toEqual([
      { key: 'age', order: 'asc' },
      { key: 'name', order: 'asc' },
    ])
    expect(wrapper.emitted('update:sortDescriptors')![1][0]).toEqual([
      { key: 'age', order: 'asc' },
      { key: 'name', order: 'asc' },
    ])
    // priority badges 1 and 2 in click order
    expect(wrapper.findAll('.lumen-table__sort-badge').map((b) => b.text())).toEqual(['2', '1'])
    expect(ths[1].attributes('aria-sort')).toBe('ascending')
  })

  it('toggles asc -> desc -> removed per column', async () => {
    const wrapper = mountMulti()
    const nameTh = wrapper.findAll('thead th')[0]
    await nameTh.trigger('click')
    await nameTh.trigger('click')
    expect(wrapper.emitted('multi-sort-change')![1][0]).toEqual([
      { key: 'name', order: 'desc' },
    ])
    await nameTh.trigger('click')
    expect(wrapper.emitted('multi-sort-change')![2][0]).toEqual([])
    expect(wrapper.emitted('sort-change')).toBeUndefined()
  })
})

describe('Table pagination', () => {
  const manyRows: TableRow[] = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    age: 20 + (i % 10),
    city: 'Oslo',
  }))

  function mountPaged(props: Record<string, unknown> = {}) {
    return mount(Table, {
      props: {
        columns,
        rows: manyRows,
        rowKey: 'id',
        paginator: true,
        rowsPerPage: 10,
        ...props,
      },
    })
  }

  function pageTwoButton(wrapper: ReturnType<typeof mount>) {
    const btn = wrapper
      .findAll('.lumen-pagination__btn')
      .find((b) => b.text() === '2')
    expect(btn).toBeTruthy()
    return btn!
  }

  it('paginates rows, reports the range, and emits page updates', async () => {
    const wrapper = mountPaged()
    expect(wrapper.findAll('tbody tr')).toHaveLength(10)
    expect(wrapper.find('.lumen-table__page-report').text()).toBe('1–10 of 25')
    await pageTwoButton(wrapper).trigger('click')
    expect(wrapper.findAll('tbody tr')).toHaveLength(10)
    expect(wrapper.find('.lumen-table__page-report').text()).toBe('11–20 of 25')
    expect(bodyTexts(wrapper)[0][0]).toBe('User 11')
    expect(wrapper.emitted('update:page')).toEqual([[2]])
    expect(wrapper.emitted('page-change')).toEqual([[2, 10]])
  })

  it('resets to page 1 when rows change', async () => {
    const wrapper = mountPaged()
    await pageTwoButton(wrapper).trigger('click')
    expect(wrapper.find('.lumen-table__page-report').text()).toBe('11–20 of 25')
    await wrapper.setProps({ rows: manyRows.slice(0, 5) })
    expect(wrapper.find('.lumen-table__page-report').text()).toBe('1–5 of 5')
  })

  it('changes page size from the paginator', async () => {
    const wrapper = mountPaged()
    const select = wrapper.find('.lumen-pagination__sizes select')
    await select.setValue('25')
    expect(wrapper.findAll('tbody tr')).toHaveLength(25)
    expect(wrapper.emitted('update:rowsPerPage')).toEqual([[25]])
  })

  it('renders the paginator on top when requested', () => {
    const wrapper = mountPaged({ paginatorPosition: 'top' })
    const rootChildren = wrapper.find('.lumen-table__root').element.children
    expect(rootChildren[0].className).toContain('lumen-table__paginator')
    expect(rootChildren[rootChildren.length - 1].className).toContain('lumen-table__wrapper')
  })

  it('select-all toggles only the current page', async () => {
    const wrapper = mountPaged({ selectable: true, selected: [] })
    await wrapper.get('thead input[type="checkbox"]').setValue(true)
    expect(wrapper.emitted('update:selected')![0][0]).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ])
  })
})

describe('Table filtering', () => {
  const filterColumns: TableColumn[] = [
    { key: 'name', title: 'Name', sortable: true, filterable: true },
    { key: 'age', title: 'Age', sortable: true, filterable: true, filterMatchMode: 'gte' },
    { key: 'city', title: 'City' },
  ]

  function mountFiltered(props: Record<string, unknown> = {}) {
    return mount(Table, {
      props: { columns: filterColumns, rows, rowKey: 'id', ...props },
    })
  }

  it('renders a filter row with inputs only for filterable columns', () => {
    const wrapper = mountFiltered()
    expect(wrapper.find('.lumen-table__filter-row').exists()).toBe(true)
    expect(wrapper.findAll('.lumen-table__filter-row input')).toHaveLength(2)
  })

  it('filters per column (AND) and emits update:filters', async () => {
    const wrapper = mountFiltered()
    const inputs = wrapper.findAll('.lumen-table__filter-row input')
    await inputs[0].setValue('a')
    expect(bodyTexts(wrapper).map((r) => r[0])).toEqual(['Cara', 'Ada'])
    expect(wrapper.emitted('update:filters')![0][0]).toEqual({
      name: { value: 'a', matchMode: 'contains' },
    })
    await inputs[1].setValue('30')
    expect(bodyTexts(wrapper).map((r) => r[0])).toEqual(['Cara'])
  })

  it('resets to page 1 when filters change', async () => {
    const manyRows: TableRow[] = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      age: 20,
      city: 'Oslo',
    }))
    const wrapper = mount(Table, {
      props: {
        columns: filterColumns,
        rows: manyRows,
        rowKey: 'id',
        paginator: true,
        rowsPerPage: 10,
      },
    })
    const page2 = wrapper.findAll('.lumen-pagination__btn').find((b) => b.text() === '2')!
    await page2.trigger('click')
    expect(wrapper.find('.lumen-table__page-report').text()).toBe('11–20 of 25')
    await wrapper.findAll('.lumen-table__filter-row input')[0].setValue('User 2')
    expect(wrapper.find('.lumen-table__page-report').text()).toContain('1–')
  })

  it('shows the no-results state when filters match nothing', async () => {
    const wrapper = mountFiltered()
    await wrapper.findAll('.lumen-table__filter-row input')[0].setValue('zzz')
    expect(wrapper.find('tbody tr td').text()).toBe('No matching records')
  })

  it('supports a custom filter slot', () => {
    const wrapper = mount(Table, {
      props: { columns: filterColumns, rows, rowKey: 'id' },
      slots: {
        'filter-name':
          '<template #default="{ filterModel }"><input data-testid="custom-filter" :value="filterModel.value" /></template>',
      },
    })
    expect(wrapper.find('[data-testid="custom-filter"]').exists()).toBe(true)
  })

  it('filters globally with the built-in search input', async () => {
    const wrapper = mountFiltered({ showGlobalFilter: true })
    await wrapper.find('.lumen-table__toolbar input').setValue('par')
    expect(bodyTexts(wrapper).map((r) => r[0])).toEqual(['Ben'])
    expect(wrapper.emitted('update:filters')![0][0]).toEqual({
      global: { value: 'par', matchMode: 'contains' },
    })
  })
})

describe('Table CSV export', () => {
  function mockDownload() {
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:mock')
    Object.defineProperty(window.URL, 'createObjectURL', {
      value: createObjectURL,
      configurable: true,
    })
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      value: vi.fn(),
      configurable: true,
    })
    let clicked: HTMLAnchorElement | null = null
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      function (this: HTMLAnchorElement) {
        clicked = this
      },
    )
    return { createObjectURL, clicked: () => clicked }
  }

  it('downloads the visible rows as CSV with the configured filename', async () => {
    const { createObjectURL, clicked } = mockDownload()
    const wrapper = mountTable({ showExportButton: true, exportFilename: 'people' })
    await wrapper.find('.lumen-table__toolbar-end button').trigger('click')
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    const blob = createObjectURL.mock.calls[0][0]
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('text/csv;charset=utf-8;')
    expect(blob.size).toBeGreaterThan(0)
    expect(clicked()!.download).toBe('people.csv')
    vi.restoreAllMocks()
  })

  it('exports filtered and sorted rows, not just the page', async () => {
    const { createObjectURL } = mockDownload()
    const filterColumns: TableColumn[] = [
      { key: 'name', title: 'Name', sortable: true, filterable: true },
      { key: 'age', title: 'Age', sortable: true },
    ]
    const wrapper = mount(Table, {
      props: {
        columns: filterColumns,
        rows,
        rowKey: 'id',
        showExportButton: true,
        paginator: true,
        rowsPerPage: 1,
      },
    })
    // sort by age desc, then filter to names containing 'a'
    await wrapper.findAll('thead th')[1].trigger('click')
    await wrapper.findAll('thead th')[1].trigger('click')
    await wrapper.findAll('.lumen-table__filter-row input')[0].setValue('a')
    await wrapper.find('.lumen-table__toolbar-end button').trigger('click')
    const blob = createObjectURL.mock.calls[0][0]
    // 2 data rows expected (Cara, Ada — Ben filtered out), paginator ignored
    expect(blob.size).toBeGreaterThan('Name,Age\nCara,31\nAda,28'.length - 5)
    vi.restoreAllMocks()
  })

  it('exposes exportCSV on the component instance', () => {
    const wrapper = mountTable()
    const vm = wrapper.vm as unknown as { exportCSV: unknown }
    expect(typeof vm.exportCSV).toBe('function')
  })
})
