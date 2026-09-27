import { Progress } from './index'
import type { ProgressStatus, ProgressType } from './Progress.vue'

/**
 * Progress stories (CSF3).
 *
 * Note: @storybook/vue3 is installed by T28, so these stories intentionally
 * avoid importing its types — T28 will upgrade them to typed
 * `Meta`/`StoryObj` and verify them with `npm run build-storybook`.
 */

interface StoryArgs {
  percent?: number
  type?: ProgressType
  status?: ProgressStatus
  showInfo?: boolean
  strokeWidth?: number
  color?: string
  size?: number
}

interface Story {
  args?: StoryArgs
  render: (args: StoryArgs) => object
}

function makeStory(args: StoryArgs): Story {
  return {
    args,
    render: (renderArgs: StoryArgs) => ({
      components: { Progress },
      setup: () => ({ args: renderArgs }),
      template: `<div style="width: 320px;"><Progress v-bind="args" /></div>`,
    }),
  }
}

export default {
  title: 'Components/Progress',
  component: Progress,
  argTypes: {
    type: { control: 'select', options: ['bar', 'circle'] },
    status: { control: 'select', options: ['active', 'success', 'exception'] },
    percent: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
}

export const Default: Story = makeStory({ percent: 40 })

export const Statuses: Story = {
  render: () => ({
    components: { Progress },
    setup: () => ({
      rows: [
        { status: 'active', percent: 45 },
        { status: 'success', percent: 100 },
        { status: 'exception', percent: 30 },
      ] as StoryArgs[],
    }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem; width: 320px;">
        <Progress v-for="(row, i) in rows" :key="i" v-bind="row" />
      </div>`,
  }),
}

export const Circle: Story = {
  args: { type: 'circle', percent: 65 },
  render: (renderArgs: StoryArgs) => ({
    components: { Progress },
    setup: () => ({ args: renderArgs }),
    template: `<Progress v-bind="args" />`,
  }),
}

export const CircleSizes: Story = {
  render: () => ({
    components: { Progress },
    setup: () => ({ args: { type: 'circle', percent: 70 } as StoryArgs }),
    template: `
      <div style="display: flex; gap: 2rem; align-items: center;">
        <Progress v-bind="args" :size="80" :stroke-width="4" />
        <Progress v-bind="args" :size="120" />
        <Progress v-bind="args" :size="160" :stroke-width="10" status="success" />
      </div>`,
  }),
}

export const NoInfo: Story = makeStory({ percent: 55, showInfo: false })

export const CustomColor: Story = makeStory({ percent: 75, color: '#8b5cf6' })
