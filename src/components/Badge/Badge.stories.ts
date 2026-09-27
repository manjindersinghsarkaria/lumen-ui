import type { Meta, StoryObj } from '@storybook/vue3'
import { Badge } from './index'
import type { BadgeVariant } from './Badge.vue'

/** Badge stories (CSF3). */

interface StoryArgs {
  count?: number | string
  max?: number
  dot?: boolean
  variant?: BadgeVariant
  showZero?: boolean
}

type Story = StoryObj<typeof Badge>

function makeStory(args: StoryArgs): Story {
  return {
    args,
    render: (renderArgs) => ({
      components: { Badge },
      setup: () => ({ args: renderArgs }),
      template: `
        <Badge v-bind="args">
          <button type="button" style="padding: 0.5rem 1rem;">Inbox</button>
        </Badge>`,
    }),
  }
}

const meta = {
  title: 'Components/Badge',
  component: Badge,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'success', 'warning', 'danger', 'info', 'neutral'],
    },
  },
} satisfies Meta<typeof Badge>

export default meta

export const Default: Story = makeStory({ count: 5 })

export const Variants: Story = {
  render: () => ({
    components: { Badge },
    setup: () => ({
      variants: ['primary', 'success', 'warning', 'danger', 'info', 'neutral'] as BadgeVariant[],
    }),
    template: `
      <div style="display: flex; gap: 1.5rem;">
        <Badge v-for="v in variants" :key="v" :variant="v" :count="3">
          <button type="button" style="padding: 0.5rem 1rem;">{{ v }}</button>
        </Badge>
      </div>`,
  }),
}

export const Dot: Story = makeStory({ dot: true, variant: 'success' })

export const Overflow: Story = makeStory({ count: 150 })

export const Zero: Story = makeStory({ count: 0, showZero: true })
