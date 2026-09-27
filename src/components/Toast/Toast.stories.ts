import { ToastHost, useToast } from './index'
import type { ToastPlacement } from './index'

/**
 * Toast stories (CSF3).
 *
 * Note: @storybook/vue3 is installed by T28, so these stories intentionally
 * avoid importing its types — T28 will upgrade them to typed
 * `Meta`/`StoryObj` and verify them with `npm run build-storybook`.
 */

interface StoryArgs {
  placement?: ToastPlacement
}

interface Story {
  args?: StoryArgs
  render: (args: StoryArgs) => object
}

function makeStory(args: StoryArgs, buttons: string): Story {
  return {
    args,
    render: (renderArgs: StoryArgs) => ({
      components: { ToastHost },
      setup: () => ({ args: renderArgs, toast: useToast() }),
      template: `
        <div>
          <ToastHost v-bind="args" />
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            ${buttons}
          </div>
        </div>`,
    }),
  }
}

const buttonStyle =
  'padding: 0.5rem 1rem; border: 1px solid var(--lumen-border); border-radius: var(--lumen-radius-sm); background: var(--lumen-bg); cursor: pointer;'

const typeButtons = `
  <button style="${buttonStyle}" @click="toast.success('Saved', { description: 'Your changes were stored.' })">Success</button>
  <button style="${buttonStyle}" @click="toast.error('Failed', { description: 'Something went wrong.' })">Error</button>
  <button style="${buttonStyle}" @click="toast.info('Heads up', { description: 'A new version is available.' })">Info</button>
  <button style="${buttonStyle}" @click="toast.warning('Careful', { description: 'This action cannot be undone.' })">Warning</button>
`

export default {
  title: 'Components/Toast',
  component: ToastHost,
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top-right',
        'top-left',
        'bottom-right',
        'bottom-left',
        'top-center',
        'bottom-center',
      ],
    },
  },
}

export const Types: Story = makeStory({}, typeButtons)

export const BottomLeft: Story = makeStory({ placement: 'bottom-left' }, typeButtons)

export const Persistent: Story = makeStory(
  {},
  `<button style="${buttonStyle}" @click="toast.info('Stays until dismissed', { duration: 0 })">Persistent toast</button>`,
)
