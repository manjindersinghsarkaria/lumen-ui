import { Button } from './index'
import type { ButtonSize, ButtonVariant } from './Button.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

/** Button stories (CSF3). */

interface StoryArgs {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  block?: boolean
}

type Story = StoryObj<typeof Button>

function makeStory(args: StoryArgs, label = 'Button'): Story {
  return {
    args,
    render: (renderArgs) => ({
      components: { Button },
      setup: () => ({ args: renderArgs }),
      template: `<Button v-bind="args">${label}</Button>`,
    }),
  }
}

const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>

export default meta

export const Default: Story = makeStory({})

export const Variants: Story = {
  render: () => ({
    components: { Button },
    setup: () => ({
      variants: ['primary', 'secondary', 'outline', 'ghost', 'danger'] as ButtonVariant[],
    }),
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <Button v-for="v in variants" :key="v" :variant="v">{{ v }}</Button>
      </div>`,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { Button },
    setup: () => ({ sizes: ['sm', 'md', 'lg'] as ButtonSize[] }),
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <Button v-for="s in sizes" :key="s" :size="s">{{ s }}</Button>
      </div>`,
  }),
}

export const Loading: Story = makeStory({ loading: true }, 'Saving…')

export const Disabled: Story = makeStory({ disabled: true })

export const Block: Story = makeStory({ block: true }, 'Full-width button')
