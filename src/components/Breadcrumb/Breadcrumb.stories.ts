import { Breadcrumb } from './index'
import type { BreadcrumbItem } from './index'

/**
 * Breadcrumb stories (CSF3).
 *
 * Note: @storybook/vue3 is installed by T28, so these stories intentionally
 * avoid importing its types — T28 will upgrade them to typed
 * `Meta`/`StoryObj` and verify them with `npm run build-storybook`.
 */

interface StoryArgs {
  items?: BreadcrumbItem[]
  separator?: string
  maxItems?: number
}

interface Story {
  args?: StoryArgs
  render: (args: StoryArgs) => object
}

const items: BreadcrumbItem[] = [
  { label: 'Home', href: '#' },
  { label: 'Library', href: '#' },
  { label: 'Data' },
]

function makeStory(args: StoryArgs): Story {
  return {
    args: { items, ...args },
    render: (renderArgs: StoryArgs) => ({
      components: { Breadcrumb },
      setup: () => ({ args: renderArgs }),
      template: `<Breadcrumb v-bind="args" />`,
    }),
  }
}

export default {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
}

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
  render: (renderArgs: StoryArgs) => ({
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
