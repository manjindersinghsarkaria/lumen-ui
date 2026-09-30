import { Table } from './index'
import type { TableColumn, TableRow } from './index'
import type { Meta, StoryObj } from '@storybook/vue3'

/** Table stories (CSF3). */

interface StoryArgs {
  columns?: TableColumn[]
  rows?: TableRow[]
  rowKey?: string
  selectable?: boolean
  loading?: boolean
  striped?: boolean
  bordered?: boolean
  multiSort?: boolean
  defaultSort?: { key: string; order: 'asc' | 'desc' }[]
  paginator?: boolean
  rowsPerPage?: number
  rowsPerPageOptions?: number[]
  paginatorPosition?: 'top' | 'bottom' | 'both'
  showGlobalFilter?: boolean
  showExportButton?: boolean
  exportFilename?: string
}

type Story = StoryObj<typeof Table>

const columns: TableColumn[] = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'age', title: 'Age', sortable: true, align: 'right', width: 80 },
  { key: 'city', title: 'City', sortable: true },
]

const rows: TableRow[] = [
  { id: 1, name: 'Cara', age: 31, city: 'Oslo' },
  { id: 2, name: 'Ben', age: 24, city: 'Paris' },
  { id: 3, name: 'Ada', age: 28, city: 'Rome' },
  { id: 4, name: 'Dev', age: 35, city: 'Lima' },
]

function makeStory(args: StoryArgs): Story {
  return {
    args: { columns, rows, rowKey: 'id', ...args },
    render: (renderArgs) => ({
      components: { Table },
      setup: () => ({ args: renderArgs }),
      template: `<Table v-bind="args" />`,
    }),
  }
}

const meta = {
  title: 'Components/Table',
  component: Table,
} satisfies Meta<typeof Table>

export default meta

export const Default: Story = makeStory({})

export const Selectable: Story = makeStory({ selectable: true })

export const StripedBordered: Story = makeStory({ striped: true, bordered: true })

export const Loading: Story = makeStory({ loading: true })

export const Empty: Story = makeStory({ rows: [] })

export const CustomCell: Story = {
  args: { columns, rows, rowKey: 'id' },
  render: (renderArgs) => ({
    components: { Table },
    setup: () => ({ args: renderArgs }),
    template: `
      <Table v-bind="args">
        <template #cell-age="{ row }">
          <strong>{{ row.age }} yrs</strong>
        </template>
      </Table>`,
  }),
}

const peopleColumns: TableColumn[] = [
  { key: 'name', title: 'Name', sortable: true, filterable: true },
  { key: 'age', title: 'Age', sortable: true, align: 'right', width: 90, filterable: true, filterMatchMode: 'gte', filterPlaceholder: 'Min age' },
  { key: 'city', title: 'City', sortable: true, filterable: true },
]

const peopleRows: TableRow[] = [
  { id: 1, name: 'Cara', age: 31, city: 'Oslo' },
  { id: 2, name: 'Ben', age: 24, city: 'Paris' },
  { id: 3, name: 'Ada', age: 28, city: 'Rome' },
  { id: 4, name: 'Dev', age: 35, city: 'Lima' },
  { id: 5, name: 'Eli', age: 24, city: 'Oslo' },
  { id: 6, name: 'Finn', age: 41, city: 'Paris' },
  { id: 7, name: 'Gus', age: 29, city: 'Rome' },
  { id: 8, name: 'Hana', age: 33, city: 'Lima' },
  { id: 9, name: 'Ivy', age: 26, city: 'Oslo' },
  { id: 10, name: 'Jay', age: 38, city: 'Paris' },
  { id: 11, name: 'Kim', age: 24, city: 'Rome' },
  { id: 12, name: 'Leo', age: 45, city: 'Lima' },
]

export const MultiSort: Story = {
  args: {
    columns: peopleColumns,
    rows: peopleRows,
    rowKey: 'id',
    multiSort: true,
    striped: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Click headers to stack sort descriptors (click again for descending, a third time to remove). Badges show the sort priority.',
      },
    },
  },
}

export const Paginated: Story = {
  args: {
    columns: peopleColumns,
    rows: peopleRows,
    rowKey: 'id',
    paginator: true,
    rowsPerPage: 5,
    rowsPerPageOptions: [5, 10, 25],
    striped: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Client-side pagination reusing the Pagination component, with a page report.',
      },
    },
  },
}

export const Filterable: Story = {
  args: {
    columns: peopleColumns,
    rows: peopleRows,
    rowKey: 'id',
    striped: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Per-column filters in the filter row (ANDed together). The Age column uses a "greater than or equal" match mode.',
      },
    },
  },
}

export const GlobalFilter: Story = {
  args: {
    columns: peopleColumns,
    rows: peopleRows,
    rowKey: 'id',
    showGlobalFilter: true,
    striped: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Built-in global search input filtering across all visible columns.',
      },
    },
  },
}

export const Exportable: Story = {
  args: {
    columns: peopleColumns,
    rows: peopleRows,
    rowKey: 'id',
    showExportButton: true,
    exportFilename: 'people',
    showGlobalFilter: true,
    striped: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Export the filtered and sorted rows (all pages) to CSV via the exposed exportCSV() method.',
      },
    },
  },
}

export const NestedFields: Story = {
  args: {
    columns: [
      { key: 'name', title: 'Name', sortable: true },
      { key: 'country', field: 'country.name', title: 'Country', sortable: true, filterable: true },
    ],
    rows: [
      { id: 1, name: 'Cara', country: { name: 'Norway' } },
      { id: 2, name: 'Ben', country: { name: 'France' } },
      { id: 3, name: 'Ada', country: { name: 'Italy' } },
    ],
    rowKey: 'id',
    striped: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Columns can read, sort, filter and export nested field paths like `country.name`.',
      },
    },
  },
}

export const CustomFilterSlot: Story = {
  args: {
    columns: peopleColumns,
    rows: peopleRows,
    rowKey: 'id',
    striped: true,
  },
  render: (renderArgs) => ({
    components: { Table },
    setup: () => ({ args: renderArgs }),
    template: `
      <Table v-bind="args">
        <template #filter-city="{ filterModel, filterCallback }">
          <select
            :value="String(filterModel.value ?? '')"
            @change="filterCallback({ value: ($event.target as HTMLSelectElement).value, matchMode: 'equals' })"
            style="width: 100%; padding: 0.375rem 0.5rem;"
            aria-label="Filter by city"
          >
            <option value="">All cities</option>
            <option>Lima</option>
            <option>Oslo</option>
            <option>Paris</option>
            <option>Rome</option>
          </select>
        </template>
      </Table>`,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Replace any column filter with custom UI via the #filter-{key} slot.',
      },
    },
  },
}
