import { ref } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import { Select } from './index'
import type { SelectOption, SelectSize } from './Select.vue'

/** Select stories (CSF3). */

interface StoryArgs {
  options?: SelectOption[]
  size?: SelectSize
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  searchable?: boolean
}

type Story = StoryObj<typeof Select>

const options: SelectOption[] = [
  { value: 'vue', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'angular', label: 'Angular', disabled: true },
]

function makeStory(args: StoryArgs): Story {
  return {
    args: { options, ...args },
    render: (renderArgs) => ({
      components: { Select },
      setup: () => ({ args: renderArgs, val: ref<string | number | null>(null) }),
      template: `<div style="width: 320px;"><Select v-model="val" v-bind="args" /></div>`,
    }),
  }
}

const meta = {
  title: 'Components/Select',
  component: Select,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Select>

export default meta

export const Default: Story = makeStory({ placeholder: 'Pick a framework' })

export const Searchable: Story = makeStory({ placeholder: 'Search…', searchable: true, clearable: true })

export const Disabled: Story = makeStory({ placeholder: 'Disabled', disabled: true })
