import type { Meta, StoryObj } from '@storybook/vue3'
import { Alert } from './index'
import type { AlertVariant } from './Alert.vue'

/** Alert stories (CSF3). */

interface StoryArgs {
  variant?: AlertVariant
  title?: string
  closable?: boolean
  showIcon?: boolean
}

type Story = StoryObj<typeof Alert>

function makeStory(args: StoryArgs, body: string): Story {
  return {
    args,
    render: (renderArgs) => ({
      components: { Alert },
      setup: () => ({ args: renderArgs }),
      template: `<div style="max-width: 480px;"><Alert v-bind="args">${body}</Alert></div>`,
    }),
  }
}

const meta = {
  title: 'Components/Alert',
  component: Alert,
  argTypes: {
    variant: { control: 'select', options: ['info', 'success', 'warning', 'danger'] },
  },
} satisfies Meta<typeof Alert>

export default meta

export const Info: Story = makeStory({ variant: 'info' }, 'This is an informational message.')

export const Variants: Story = {
  render: () => ({
    components: { Alert },
    setup: () => ({
      variants: ['info', 'success', 'warning', 'danger'] as AlertVariant[],
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 480px;">
        <Alert v-for="v in variants" :key="v" :variant="v" :title="v">{{ 'A ' + v + ' alert.' }}</Alert>
      </div>`,
  }),
}

export const Closable: Story = makeStory(
  { variant: 'warning', title: 'Heads up', closable: true },
  'You can dismiss this alert.',
)

export const CustomSlots: Story = {
  render: () => ({
    components: { Alert },
    template: `
      <div style="max-width: 480px;">
        <Alert variant="success">
          <template #title><strong>All done!</strong></template>
          <template #description>Your export finished <em>successfully</em>.</template>
        </Alert>
      </div>`,
  }),
}
