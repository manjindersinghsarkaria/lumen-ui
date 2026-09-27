import { Tooltip } from './index'
import type { TooltipPlacement, TooltipTrigger } from './Tooltip.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

/** Tooltip stories (CSF3). */

interface StoryArgs {
  content?: string
  placement?: TooltipPlacement
  trigger?: TooltipTrigger | TooltipTrigger[]
  showDelay?: number
  hideDelay?: number
  disabled?: boolean
}

type Story = StoryObj<typeof Tooltip>

function triggerButton(label = 'Hover me'): string {
  return `<button type="button" style="padding: 0.5rem 1rem;">${label}</button>`
}

function makeStory(args: StoryArgs, buttonLabel?: string): Story {
  return {
    args,
    render: (renderArgs) => ({
      components: { Tooltip },
      setup: () => ({ args: renderArgs }),
      template: `<div style="padding: 4rem; text-align: center;"><Tooltip v-bind="args">${triggerButton(buttonLabel)}</Tooltip></div>`,
    }),
  }
}

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  argTypes: {
    placement: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    trigger: { control: 'select', options: ['hover', 'focus', 'click'] },
  },
} satisfies Meta<typeof Tooltip>

export default meta

export const Default: Story = makeStory({ content: 'This is a helpful tooltip' })

export const Placements: Story = {
  render: () => ({
    components: { Tooltip },
    setup: () => ({
      placements: ['top', 'right', 'bottom', 'left'] as TooltipPlacement[],
    }),
    template: `
      <div style="display: flex; gap: 3rem; padding: 4rem; justify-content: center;">
        <Tooltip v-for="p in placements" :key="p" :placement="p" :content="'Placement: ' + p">
          <button type="button" style="padding: 0.5rem 1rem;">{{ p }}</button>
        </Tooltip>
      </div>`,
  }),
}

export const ClickTrigger: Story = makeStory(
  { content: 'Click the button again, press Escape, or click elsewhere to dismiss', trigger: 'click' },
  'Click me',
)

export const FocusTrigger: Story = makeStory(
  { content: 'Shown while the button has keyboard focus', trigger: 'focus' },
  'Tab to me',
)

export const WithDelay: Story = makeStory(
  { content: 'Appears after a 500ms delay', showDelay: 500, hideDelay: 300 },
  'Hover me (delayed)',
)

export const Disabled: Story = makeStory({ content: 'You should never see this', disabled: true })

export const RichContent: Story = {
  render: () => ({
    components: { Tooltip },
    template: `
      <div style="padding: 4rem; text-align: center;">
        <Tooltip placement="bottom">
          <template #content><strong>Bold</strong> and <em>rich</em> tooltip content</template>
          <button type="button" style="padding: 0.5rem 1rem;">Rich content</button>
        </Tooltip>
      </div>`,
  }),
}
