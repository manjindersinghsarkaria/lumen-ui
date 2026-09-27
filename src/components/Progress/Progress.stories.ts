import { Progress } from './index'
import type { ProgressStatus, ProgressType } from './Progress.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

/** Progress stories (CSF3). */

interface StoryArgs {
  percent?: number
  type?: ProgressType
  status?: ProgressStatus
  showInfo?: boolean
  strokeWidth?: number
  color?: string
  size?: number
}

type Story = StoryObj<typeof Progress>

function makeStory(args: StoryArgs): Story {
  return {
    args,
    render: (renderArgs) => ({
      components: { Progress },
      setup: () => ({ args: renderArgs }),
      template: `<div style="width: 320px;"><Progress v-bind="args" /></div>`,
    }),
  }
}

const meta = {
  title: 'Components/Progress',
  component: Progress,
  argTypes: {
    type: { control: 'select', options: ['bar', 'circle'] },
    status: { control: 'select', options: ['active', 'success', 'exception'] },
    percent: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
} satisfies Meta<typeof Progress>

export default meta

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
  render: (renderArgs) => ({
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
