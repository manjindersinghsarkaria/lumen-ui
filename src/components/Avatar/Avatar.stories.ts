import { Avatar, AvatarGroup } from './index'
import type { AvatarShape, AvatarSize, AvatarStatus } from './Avatar.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

/** Avatar stories (CSF3). */

interface AvatarStoryArgs {
  src?: string
  name?: string
  initials?: string
  size?: AvatarSize | number
  shape?: AvatarShape
  status?: AvatarStatus
}

type Story = StoryObj<typeof Avatar>

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'select', options: ['circle', 'square'] },
    status: { control: 'select', options: ['online', 'offline', 'busy', 'away'] },
  },
} satisfies Meta<typeof Avatar>

export default meta

function avatarTemplate(extra = ''): string {
  return `<Avatar v-bind="args" ${extra} />`
}

export const Initials: Story = {
  args: { name: 'Ada Lovelace' } as AvatarStoryArgs,
  render: (args) => ({
    components: { Avatar },
    setup: () => ({ args }),
    template: `<div style="padding: 2rem;">${avatarTemplate()}</div>`,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { Avatar },
    setup: () => ({ sizes: ['xs', 'sm', 'md', 'lg', 'xl'] as AvatarSize[] }),
    template: `
      <div style="display: flex; gap: 1rem; align-items: center; padding: 2rem;">
        <Avatar v-for="s in sizes" :key="s" :size="s" name="Ada Lovelace" />
      </div>`,
  }),
}

export const SquareWithStatus: Story = {
  args: { name: 'Grace Hopper', shape: 'square', status: 'online', size: 'lg' } as AvatarStoryArgs,
  render: (args) => ({
    components: { Avatar },
    setup: () => ({ args }),
    template: `<div style="padding: 2rem;">${avatarTemplate()}</div>`,
  }),
}

export const Group: Story = {
  render: () => ({
    components: { Avatar, AvatarGroup },
    template: `
      <div style="padding: 2rem;">
        <AvatarGroup :max="3">
          <Avatar name="Ada Lovelace" status="online" />
          <Avatar name="Grace Hopper" status="busy" />
          <Avatar name="Katherine Johnson" status="away" />
          <Avatar name="Radia Perlman" />
          <Avatar name="Barbara Liskov" />
        </AvatarGroup>
      </div>`,
  }),
}
