import { Accordion } from './index'
import type { AccordionItem, AccordionIconPosition } from './Accordion.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

/** Accordion stories (CSF3). */

interface StoryArgs {
  items?: AccordionItem[]
  accordion?: boolean
  expandIconPosition?: AccordionIconPosition
  modelValue?: Array<string | number>
}

type Story = StoryObj<typeof Accordion>

const sampleItems: AccordionItem[] = [
  { key: 'a', title: 'What is lumen-ui?' },
  { key: 'b', title: 'How do I theme it?' },
  { key: 'c', title: 'Does it support dark mode?', disabled: true },
]

const sampleContent: Record<string, string> = {
  a: 'lumen-ui is a Vue 3 + TypeScript component library with built-in i18n and org-configurable theming.',
  b: 'Wrap your app in ThemeProvider and call setTheme() with any brand color — the full palette is derived automatically.',
  c: 'This section is disabled.',
}

function makeStory(args: StoryArgs): Story {
  return {
    args,
    render: (renderArgs) => ({
      components: { Accordion },
      setup: () => ({ args: renderArgs, content: sampleContent }),
      template: `
        <div style="max-width: 36rem;">
          <Accordion v-bind="args" v-model="args.modelValue">
            <template #content="{ item }"><p style="margin: 0;">{{ content[item.key] }}</p></template>
          </Accordion>
        </div>`,
    }),
  }
}

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  argTypes: {
    expandIconPosition: { control: 'select', options: ['left', 'right'] },
  },
} satisfies Meta<typeof Accordion>

export default meta

export const Default: Story = makeStory({ items: sampleItems, modelValue: ['a'] })

export const AccordionMode: Story = makeStory({
  items: sampleItems,
  accordion: true,
  modelValue: ['b'],
})

export const IconLeft: Story = makeStory({
  items: sampleItems,
  expandIconPosition: 'left',
  modelValue: ['a'],
})
