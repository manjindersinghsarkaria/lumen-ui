import { Tabs } from './index'
import type { TabItem, TabsVariant } from './Tabs.vue'

/**
 * Tabs stories (CSF3).
 *
 * Note: @storybook/vue3 is installed by T28, so these stories intentionally
 * avoid importing its types — T28 will upgrade them to typed
 * `Meta`/`StoryObj` and verify them with `npm run build-storybook`.
 */

interface StoryArgs {
  items?: TabItem[]
  variant?: TabsVariant
  closable?: boolean
  modelValue?: string | number
}

interface Story {
  args?: StoryArgs
  render: (args: StoryArgs) => object
}

const sampleItems: TabItem[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'activity', label: 'Activity' },
  { key: 'settings', label: 'Settings', disabled: true },
]

function makeStory(args: StoryArgs): Story {
  return {
    args,
    render: (renderArgs: StoryArgs) => ({
      components: { Tabs },
      setup: () => ({ args: renderArgs }),
      template: `
        <Tabs v-bind="args" v-model="args.modelValue">
          <template #panel="{ item }">
            <p>Content for <strong>{{ item?.label }}</strong> (key: {{ item?.key }})</p>
          </template>
        </Tabs>`,
    }),
  }
}

export default {
  title: 'Components/Tabs',
  component: Tabs,
  argTypes: {
    variant: { control: 'select', options: ['line', 'card'] },
  },
}

export const Line: Story = makeStory({ items: sampleItems, modelValue: 'overview' })

export const Card: Story = makeStory({
  items: sampleItems,
  variant: 'card',
  modelValue: 'activity',
})

export const Closable: Story = makeStory({
  items: [
    { key: 'tab-1', label: 'Tab one' },
    { key: 'tab-2', label: 'Tab two' },
    { key: 'tab-3', label: 'Tab three' },
  ],
  closable: true,
  modelValue: 'tab-1',
})

export const WithExtra: Story = {
  args: { items: sampleItems, modelValue: 'overview' },
  render: (renderArgs: StoryArgs) => ({
    components: { Tabs },
    setup: () => ({ args: renderArgs }),
    template: `
      <Tabs v-bind="args" v-model="args.modelValue">
        <template #extra><button type="button" style="padding: 0.375rem 0.75rem;">+ Add tab</button></template>
      </Tabs>`,
  }),
}
