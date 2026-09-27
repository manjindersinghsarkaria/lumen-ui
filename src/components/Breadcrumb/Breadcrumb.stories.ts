import { Breadcrumb } from './index'
import type { BreadcrumbItem } from './index'
import type { Meta, StoryObj } from '@storybook/vue3'

/** Breadcrumb stories (CSF3). */

interface StoryArgs {
  items?: BreadcrumbItem[]
  separator?: string
  maxItems?: number
}

type Story = StoryObj<typeof Breadcrumb>

const items: BreadcrumbItem[] = [
  { label: 'Home', href: '#' },
  { label: 'Library', href: '#' },
  { label: 'Data' },
]

function makeStory(args: StoryArgs): Story {
  return {
    args: { items, ...args },
    render: (renderArgs) => ({
      components: { Breadcrumb },
      setup: () => ({ args: renderArgs }),
      template: `<Breadcrumb v-bind="args" />`,
    }),
  }
}

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
} satisfies Meta<typeof Breadcrumb>

export default meta

export const Default: Story = makeStory({})

export const CustomSeparator: Story = makeStory({ separator: '›' })

export const Collapsed: Story = makeStory({
  maxItems: 3,
  items: [
    { label: 'Home', href: '#' },
    { label: 'Category', href: '#' },
    { label: 'Subcategory', href: '#' },
    { label: 'Section', href: '#' },
    { label: 'Article' },
  ],
})

export const WithIcons: Story = {
  args: { items },
  render: (renderArgs) => ({
    components: { Breadcrumb },
    setup: () => ({ args: renderArgs }),
    template: `
      <Breadcrumb v-bind="args">
        <template #item-icon="{ index }">
          <span>{{ ['⌂', '▤', '▦'][index] ?? '•' }}</span>
        </template>
      </Breadcrumb>`,
  }),
}
