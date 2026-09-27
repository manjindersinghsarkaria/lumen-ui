import { Spinner } from './index'
import type { SpinnerSize } from './Spinner.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

/** Spinner stories (CSF3). */

interface StoryArgs {
  size?: SpinnerSize | number
  fullscreen?: boolean
  tip?: string
}

type Story = StoryObj<typeof Spinner>

function makeStory(args: StoryArgs): Story {
  return {
    args,
    render: (renderArgs) => ({
      components: { Spinner },
      setup: () => ({ args: renderArgs }),
      template: `<Spinner v-bind="args" />`,
    }),
  }
}

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Spinner>

export default meta

export const Default: Story = makeStory({})

export const Sizes: Story = {
  render: () => ({
    components: { Spinner },
    setup: () => ({ sizes: ['sm', 'md', 'lg'] as SpinnerSize[] }),
    template: `
      <div style="display: flex; gap: 2rem; align-items: center;">
        <Spinner v-for="s in sizes" :key="s" :size="s" />
        <Spinner :size="48" />
      </div>`,
  }),
}

export const WithTip: Story = makeStory({ tip: 'Fetching data…' })

export const Fullscreen: Story = makeStory({ fullscreen: true, tip: 'Loading application…' })
