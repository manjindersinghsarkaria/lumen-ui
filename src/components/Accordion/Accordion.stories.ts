import { Accordion } from './index'
import type { AccordionItem, AccordionIconPosition } from './Accordion.vue'

/**
 * Accordion stories (CSF3).
 *
 * Note: @storybook/vue3 is installed by T28, so these stories intentionally
 * avoid importing its types — T28 will upgrade them to typed
 * `Meta`/`StoryObj` and verify them with `npm run build-storybook`.
 */

interface StoryArgs {
  items?: AccordionItem[]
  accordion?: boolean
  expandIconPosition?: AccordionIconPosition
  modelValue?: Array<string | number>
}

interface Story {
  args?: StoryArgs
  render: (args: StoryArgs) => object
}

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
    render: (renderArgs: StoryArgs) => ({
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

export default {
  title: 'Components/Accordion',
  component: Accordion,
  argTypes: {
    expandIconPosition: { control: 'select', options: ['left', 'right'] },
  },
}

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
