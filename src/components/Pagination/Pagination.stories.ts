import { Pagination } from './index'

/**
 * Pagination stories (CSF3).
 *
 * Note: @storybook/vue3 is installed by T28, so these stories intentionally
 * avoid importing its types — T28 will upgrade them to typed
 * `Meta`/`StoryObj` and verify them with `npm run build-storybook`.
 */

interface StoryArgs {
  page?: number
  pageSize?: number
  total?: number
  pageSizes?: number[]
  showSizeChanger?: boolean
  showJumper?: boolean
  disabled?: boolean
}

interface Story {
  args?: StoryArgs
  render: (args: StoryArgs) => object
}

function makeStory(args: StoryArgs): Story {
  return {
    args,
    render: (renderArgs: StoryArgs) => ({
      components: { Pagination },
      setup: () => ({ args: renderArgs }),
      template: `<Pagination v-bind="args" />`,
    }),
  }
}

export default {
  title: 'Components/Pagination',
  component: Pagination,
}

export const Default: Story = makeStory({ total: 95 })

export const ManyPages: Story = makeStory({ total: 500, page: 25 })

export const WithJumper: Story = makeStory({ total: 300, showJumper: true })

export const CustomSizes: Story = makeStory({
  total: 120,
  pageSizes: [5, 10, 25],
  pageSize: 5,
})

export const Disabled: Story = makeStory({ total: 95, disabled: true })
