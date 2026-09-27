import { ref } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import { Switch } from './index'
import type { SwitchSize } from './Switch.vue'

/** Switch stories (CSF3). */

type Story = StoryObj<typeof Switch>

const meta = {
  title: 'Components/Switch',
  component: Switch,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Switch>

export default meta

export const Default: Story = {
  render: () => ({
    components: { Switch },
    setup: () => ({ on: ref(false) }),
    template: `<Switch v-model="on" />`,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { Switch },
    setup: () => ({ on: ref(true), sizes: ['sm', 'md', 'lg'] as SwitchSize[] }),
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <Switch v-for="s in sizes" :key="s" v-model="on" :size="s" />
      </div>`,
  }),
}

export const WithLabels: Story = {
  args: { checkedLabel: 'On', uncheckedLabel: 'Off' },
  render: (renderArgs) => ({
    components: { Switch },
    setup: () => ({ args: renderArgs, on: ref(true) }),
    template: `<Switch v-model="on" v-bind="args" />`,
  }),
}

export const Loading: Story = {
  render: () => ({
    components: { Switch },
    setup: () => ({ on: ref(false) }),
    template: `<Switch v-model="on" loading />`,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { Switch },
    setup: () => ({ on: ref(true) }),
    template: `<Switch v-model="on" disabled />`,
  }),
}
