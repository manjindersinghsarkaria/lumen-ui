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
