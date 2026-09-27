import { Spinner } from './index'
import type { SpinnerSize } from './Spinner.vue'

/**
 * Spinner stories (CSF3).
 *
 * Note: @storybook/vue3 is installed by T28, so these stories intentionally
 * avoid importing its types — T28 will upgrade them to typed
 * `Meta`/`StoryObj` and verify them with `npm run build-storybook`.
 */

interface StoryArgs {
  size?: SpinnerSize | number
  fullscreen?: boolean
  tip?: string
}

interface Story {
  args?: StoryArgs
  render: (args: StoryArgs) => object
}

function makeStory(args: StoryArgs): Story {
  return {
    args,
    render: (renderArgs: StoryArgs) => ({
      components: { Spinner },
      setup: () => ({ args: renderArgs }),
      template: `<Spinner v-bind="args" />`,
    }),
  }
}

export default {
  title: 'Components/Spinner',
  component: Spinner,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}

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
