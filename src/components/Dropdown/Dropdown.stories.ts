import { Dropdown } from './index'
import type { DropdownItem, DropdownPlacement } from './Dropdown.vue'

/**
 * Dropdown stories (CSF3).
 *
 * Note: @storybook/vue3 is installed by T28, so these stories intentionally
 * avoid importing its types — T28 will upgrade them to typed
 * `Meta`/`StoryObj` and verify them with `npm run build-storybook`.
 */

interface StoryArgs {
  items?: DropdownItem[]
  placement?: DropdownPlacement
  disabled?: boolean
  open?: boolean
}

interface Story {
  args?: StoryArgs
  render: (args: StoryArgs) => object
}

const sampleItems: DropdownItem[] = [
  { label: 'Edit', value: 'edit' },
  { label: 'Duplicate', value: 'duplicate' },
  { label: 'Share', value: 'share', divided: true },
  { label: 'Delete', value: 'delete', danger: true },
  { label: 'Archive', value: 'archive', disabled: true },
]

function makeStory(args: StoryArgs, triggerLabel = 'Open menu'): Story {
  return {
    args,
    render: (renderArgs: StoryArgs) => ({
      components: { Dropdown },
      setup: () => ({ args: renderArgs }),
      template: `
        <div style="padding: 4rem; text-align: center; min-height: 16rem;">
          <Dropdown v-bind="args">
            <button type="button" style="padding: 0.5rem 1rem;">${triggerLabel} ▾</button>
          </Dropdown>
        </div>`,
    }),
  }
}

export default {
  title: 'Components/Dropdown',
  component: Dropdown,
  argTypes: {
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom-end', 'top-start', 'top-end'],
    },
  },
}

export const Default: Story = makeStory({ items: sampleItems })

export const Placements: Story = {
  render: () => ({
    components: { Dropdown },
    setup: () => ({
      placements: ['bottom-start', 'bottom-end', 'top-start', 'top-end'] as DropdownPlacement[],
      items: sampleItems,
    }),
    template: `
      <div style="display: flex; gap: 2rem; padding: 6rem 2rem; justify-content: center;">
        <Dropdown v-for="p in placements" :key="p" :placement="p" :items="items">
          <button type="button" style="padding: 0.5rem 1rem;">{{ p }} ▾</button>
        </Dropdown>
      </div>`,
  }),
}

export const WithIcons: Story = {
  args: {
    items: [
      { label: 'Profile', value: 'profile', icon: 'user' },
      { label: 'Settings', value: 'settings', icon: 'gear' },
      { label: 'Log out', value: 'logout', icon: 'exit', danger: true, divided: true },
    ],
  },
  render: (renderArgs: StoryArgs) => ({
    components: { Dropdown },
    setup: () => ({ args: renderArgs }),
    template: `
      <div style="padding: 4rem; text-align: center; min-height: 16rem;">
        <Dropdown v-bind="args">
          <template #item-icon="{ item }"><span style="font-size: 0.875rem;">[{{ item.icon }}]</span></template>
          <button type="button" style="padding: 0.5rem 1rem;">Account ▾</button>
        </Dropdown>
      </div>`,
  }),
}

export const Disabled: Story = makeStory({ items: sampleItems, disabled: true })

export const Empty: Story = makeStory({ items: [] })
