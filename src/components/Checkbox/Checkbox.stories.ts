import { ref } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import { Checkbox, CheckboxGroup } from './index'
import type { CheckboxGroupOption } from './index'

/** Checkbox stories (CSF3). */

type Story = StoryObj<typeof Checkbox>

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
} satisfies Meta<typeof Checkbox>

export default meta

export const Default: Story = {
  render: () => ({
    components: { Checkbox },
    setup: () => ({ checked: ref(false) }),
    template: `<Checkbox v-model="checked" label="Accept terms" />`,
  }),
}

export const Indeterminate: Story = {
  render: () => ({
    components: { Checkbox },
    setup: () => ({ checked: ref(false) }),
    template: `<Checkbox v-model="checked" :indeterminate="true" label="Partially selected" />`,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { Checkbox },
    setup: () => ({ checked: ref(true) }),
    template: `<Checkbox v-model="checked" disabled label="Disabled" />`,
  }),
}

export const Group: Story = {
  render: () => ({
    components: { CheckboxGroup },
    setup: () => ({
      val: ref<(string | number)[]>(['vue']),
      options: [
        { value: 'vue', label: 'Vue' },
        { value: 'react', label: 'React' },
        { value: 'svelte', label: 'Svelte', disabled: true },
      ] as CheckboxGroupOption[],
    }),
    template: `<CheckboxGroup v-model="val" :options="options" />`,
  }),
}

export const GroupMax: Story = {
  render: () => ({
    components: { CheckboxGroup },
    setup: () => ({
      val: ref<(string | number)[]>([]),
      options: [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
        { value: 'c', label: 'C' },
      ] as CheckboxGroupOption[],
    }),
    template: `<div><p>Pick at most 2:</p><CheckboxGroup v-model="val" :options="options" :max="2" /></div>`,
  }),
}
