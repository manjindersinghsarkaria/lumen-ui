import { ref } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import { Modal } from './index'
import type { ModalSize } from './Modal.vue'

/** Modal stories (CSF3). */

interface StoryArgs {
  title?: string
  size?: ModalSize
  closable?: boolean
  closeOnEscape?: boolean
  closeOnBackdrop?: boolean
}

type Story = StoryObj<typeof Modal>

function makeStory(args: StoryArgs): Story {
  return {
    args,
    render: (renderArgs) => ({
      components: { Modal },
      setup: () => ({ args: renderArgs, open: ref(false) }),
      template: `
        <div>
          <button type="button" style="padding: 0.5rem 1rem;" @click="open = true">Open modal</button>
          <Modal v-model:open="open" v-bind="args">
            <p style="margin: 0 0 1rem;">Modal body content. Press Escape or click the backdrop to dismiss.</p>
          </Modal>
        </div>`,
    }),
  }
}

const meta = {
  title: 'Components/Modal',
  component: Modal,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
  },
} satisfies Meta<typeof Modal>

export default meta

export const Default: Story = makeStory({ title: 'Example modal' })

export const Sizes: Story = {
  render: () => ({
    components: { Modal },
    setup: () => ({
      open: ref(false),
      currentSize: ref<ModalSize>('md'),
      sizes: ['sm', 'md', 'lg', 'xl'] as ModalSize[],
    }),
    template: `
      <div>
        <div style="display: flex; gap: 0.5rem;">
          <button
            v-for="s in sizes"
            :key="s"
            type="button"
            style="padding: 0.5rem 1rem;"
            @click="currentSize = s; open = true"
          >{{ s }}</button>
        </div>
        <Modal v-model:open="open" :size="currentSize" title="Sized modal">
          <p style="margin: 0;">This modal uses size "{{ currentSize }}".</p>
        </Modal>
      </div>`,
  }),
}

export const CustomSlots: Story = {
  render: () => ({
    components: { Modal },
    setup: () => ({ open: ref(false) }),
    template: `
      <div>
        <button type="button" style="padding: 0.5rem 1rem;" @click="open = true">Open modal</button>
        <Modal v-model:open="open">
          <template #header><strong>Custom header</strong></template>
          <p style="margin: 0;">Body with custom header and footer slots.</p>
          <template #footer>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button type="button" @click="open = false">Cancel</button>
              <button type="button" @click="open = false">Confirm</button>
            </div>
          </template>
        </Modal>
      </div>`,
  }),
}
