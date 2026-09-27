import { ref } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import { Radio, RadioGroup } from './index'
import type { RadioGroupOption } from './index'

/** Radio stories (CSF3). */

type Story = StoryObj<typeof Radio>

const meta = {
  title: 'Components/Radio',
  component: Radio,
} satisfies Meta<typeof Radio>

export default meta

export const Default: Story = {
  render: () => ({
    components: { Radio },
    setup: () => ({ picked: ref('a') }),
    template: `
      <div style="display: flex; gap: 1rem;">
        <Radio v-model="picked" value="a" label="Option A" />
        <Radio v-model="picked" value="b" label="Option B" />
      </div>`,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { Radio },
    setup: () => ({ picked: ref('a') }),
    template: `<Radio v-model="picked" value="a" disabled label="Disabled" />`,
  }),
}

export const Group: Story = {
  render: () => ({
    components: { RadioGroup },
    setup: () => ({
      val: ref<string | number | boolean>('vue'),
      options: [
        { value: 'vue', label: 'Vue' },
        { value: 'react', label: 'React' },
        { value: 'svelte', label: 'Svelte' },
      ] as RadioGroupOption[],
    }),
    template: `<RadioGroup v-model="val" :options="options" />`,
  }),
}

export const GroupColumn: Story = {
  render: () => ({
    components: { RadioGroup },
    setup: () => ({
      val: ref<string | number | boolean>('m'),
      options: [
        { value: 's', label: 'Small' },
        { value: 'm', label: 'Medium' },
        { value: 'l', label: 'Large' },
      ] as RadioGroupOption[],
    }),
    template: `<RadioGroup v-model="val" :options="options" direction="column" />`,
  }),
}
