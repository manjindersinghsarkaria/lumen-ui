<script setup lang="ts">
import { computed, provide, useSlots } from 'vue'
import type { VNode } from 'vue'
import Avatar from './Avatar.vue'
import type { AvatarShape, AvatarSize } from './Avatar.vue'

/**
 * AvatarGroup — overlapping stack of Avatars with an optional "+N"
 * overflow indicator. Size/shape cascade to child Avatars via provide/inject
 * unless a child overrides them.
 */

export interface AvatarGroupContext {
  size: AvatarSize | number
  shape: AvatarShape
}

export interface AvatarGroupProps {
  /** Maximum avatars shown before collapsing the rest into a "+N" avatar. */
  max?: number
  /** Cascades to child Avatars. */
  size?: AvatarSize | number
  /** Cascades to child Avatars. */
  shape?: AvatarShape
}

const props = withDefaults(defineProps<AvatarGroupProps>(), {
  max: undefined,
  size: 'md',
  shape: 'circle',
})

provide<AvatarGroupContext>('lumenAvatarGroup', props)

const slots = useSlots()

function flatten(nodes: VNode[]): VNode[] {
  const out: VNode[] = []
  for (const node of nodes) {
    if (Array.isArray(node.children)) {
      out.push(...flatten(node.children as VNode[]))
    } else {
      out.push(node)
    }
  }
  return out
}

const children = computed(() => flatten(slots.default?.() ?? []))

const visibleChildren = computed(() =>
  props.max !== undefined ? children.value.slice(0, props.max) : children.value,
)

const overflowCount = computed(() => children.value.length - visibleChildren.value.length)
</script>

<template>
  <div class="lumen-avatar-group" role="group" :aria-label="`Avatar group, ${children.length} members`">
    <template v-for="(vnode, index) in visibleChildren" :key="index">
      <component :is="vnode" />
    </template>
    <Avatar v-if="overflowCount > 0" class="lumen-avatar-group__overflow" :aria-label="`${overflowCount} more`">
      +{{ overflowCount }}
    </Avatar>
  </div>
</template>

<style>
.lumen-avatar-group {
  display: inline-flex;
  align-items: center;
}

.lumen-avatar-group > .lumen-avatar {
  margin-left: -0.625rem;
  box-shadow: 0 0 0 2px var(--lumen-surface);
}
.lumen-avatar-group > .lumen-avatar:first-child {
  margin-left: 0;
}

.lumen-avatar-group__overflow {
  background-color: var(--lumen-bg-subtle);
  color: var(--lumen-text);
  font-weight: 600;
}
</style>
