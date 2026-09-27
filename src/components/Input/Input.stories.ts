import { ref } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import { Input } from './index'
import type { InputSize, InputType } from './Input.vue'

/** Input stories (CSF3). */

interface StoryArgs {
  type?: InputType
  size?: InputSize
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  error?: string
}

type Story = StoryObj<typeof Input>

function makeStory(args: StoryArgs): Story {
  return {
    args,
    render: (renderArgs) => ({
      components: { Input },
      setup: () => ({ args: renderArgs, val: ref('') }),
      template: `<div style="width: 320px;"><Input v-model="val" v-bind="args" /></div>`,
    }),
  }
}

const meta = {
  title: 'Components/Input',
  component: Input,
  argTypes: {
    type: { control: 'select', options: ['text', 'password', 'number', 'email'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Input>

export default meta

export const Default: Story = makeStory({ placeholder: 'Type something…' })

export const Sizes: Story = {
  render: () => ({
    components: { Input },
    setup: () => ({ sizes: ['sm', 'md', 'lg'] as InputSize[], val: ref('') }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem; width: 320px;">
        <Input v-for="s in sizes" :key="s" v-model="val" :size="s" :placeholder="'Size ' + s" />
      </div>`,
  }),
}

export const WithError: Story = makeStory({
  placeholder: 'Email address',
  type: 'email',
  clearable: true,
  error: 'Please enter a valid email address.',
})

export const Disabled: Story = makeStory({ placeholder: 'Disabled', disabled: true })

export const PrefixSuffix: Story = {
  render: () => ({
    components: { Input },
    setup: () => ({ val: ref('') }),
    template: `
      <div style="width: 320px;">
        <Input v-model="val" placeholder="Search…">
          <template #prefix>⌕</template>
          <template #suffix>.com</template>
        </Input>
      </div>`,
  }),
}
