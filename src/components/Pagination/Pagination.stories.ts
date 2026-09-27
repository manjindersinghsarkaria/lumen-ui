import { Pagination } from './index'
import type { Meta, StoryObj } from '@storybook/vue3'

/** Pagination stories (CSF3). */

interface StoryArgs {
  page?: number
  pageSize?: number
  total?: number
  pageSizes?: number[]
  showSizeChanger?: boolean
  showJumper?: boolean
  disabled?: boolean
}

type Story = StoryObj<typeof Pagination>

function makeStory(args: StoryArgs): Story {
  return {
    args,
    render: (renderArgs) => ({
      components: { Pagination },
      setup: () => ({ args: renderArgs }),
      template: `<Pagination v-bind="args" />`,
    }),
  }
}

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
} satisfies Meta<typeof Pagination>

export default meta

export const Default: Story = makeStory({ total: 95 })

export const ManyPages: Story = makeStory({ total: 500, page: 25 })

export const WithJumper: Story = makeStory({ total: 300, showJumper: true })

export const CustomSizes: Story = makeStory({
  total: 120,
  pageSizes: [5, 10, 25],
  pageSize: 5,
})

export const Disabled: Story = makeStory({ total: 95, disabled: true })
