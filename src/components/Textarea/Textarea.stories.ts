import { ref } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import { Textarea } from './index'
import type { TextareaSize } from './Textarea.vue'

/** Textarea stories (CSF3). */

interface StoryArgs {
  size?: TextareaSize
  placeholder?: string
  disabled?: boolean
  error?: string
  maxlength?: number
  rows?: number
  autosize?: boolean
}

type Story = StoryObj<typeof Textarea>

function makeStory(args: StoryArgs): Story {
  return {
    args,
    render: (renderArgs) => ({
      components: { Textarea },
      setup: () => ({ args: renderArgs, val: ref('') }),
      template: `<div style="width: 360px;"><Textarea v-model="val" v-bind="args" /></div>`,
    }),
  }
}

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Textarea>

export default meta

export const Default: Story = makeStory({ placeholder: 'Write something…', rows: 3 })

export const Autosize: Story = makeStory({ placeholder: 'Grows as you type…', autosize: true })

export const WithCounter: Story = makeStory({ placeholder: 'Max 120 chars', maxlength: 120 })

export const WithError: Story = makeStory({ error: 'This field is required.' })

export const Disabled: Story = makeStory({ placeholder: 'Disabled', disabled: true })
