import type { Meta, StoryObj } from '@storybook/vue3'
import { Card } from './index'

/** Card stories (CSF3). */

interface StoryArgs {
  title?: string
  subtitle?: string
  bordered?: boolean
  shadow?: boolean
  hoverable?: boolean
}

type Story = StoryObj<typeof Card>

function makeStory(args: StoryArgs): Story {
  return {
    args,
    render: (renderArgs) => ({
      components: { Card },
      setup: () => ({ args: renderArgs }),
      template: `
        <div style="max-width: 360px;">
          <Card v-bind="args">
            <p style="margin: 0;">Card body content goes here. It can hold any markup.</p>
          </Card>
        </div>`,
    }),
  }
}

const meta = {
  title: 'Components/Card',
  component: Card,
} satisfies Meta<typeof Card>

export default meta

export const Default: Story = makeStory({ title: 'Card title', subtitle: 'A short subtitle' })

export const Plain: Story = makeStory({})

export const Hoverable: Story = makeStory({ title: 'Hover me', hoverable: true, shadow: true })

export const CustomSlots: Story = {
  render: () => ({
    components: { Card },
    template: `
      <div style="max-width: 360px;">
        <Card>
          <template #header><strong>Custom header</strong></template>
          <p style="margin: 0;">Body with a fully custom header slot.</p>
          <template #footer><em>Custom footer</em></template>
        </Card>
      </div>`,
  }),
}
