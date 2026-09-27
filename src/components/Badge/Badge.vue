<script setup lang="ts">
import { computed } from 'vue'

/**
 * Badge — status dot or count anchored to the top-right of its slot content.
 */

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

export interface BadgeProps {
  /** Count to display; strings are shown as-is. */
  count?: number | string
  /** Counts above this are rendered as "max+". */
  max?: number
  /** Renders a plain dot instead of a count. */
  dot?: boolean
  /** Status color. */
  variant?: BadgeVariant
  /** Show the badge when count is 0. */
  showZero?: boolean
  /** Pixel offset [x, y] applied to the badge position. */
  offset?: [number, number]
  /** Accessible label describing the badge (e.g. "5 unread"). */
  ariaLabel?: string
}

const props = withDefaults(defineProps<BadgeProps>(), {
  count: undefined,
  max: 99,
  dot: false,
  variant: 'danger',
  showZero: false,
  offset: undefined,
  ariaLabel: undefined,
})

const display = computed(() => {
  if (typeof props.count === 'number' && props.count > props.max) {
    return `${props.max}+`
  }
  return String(props.count)
})

const visible = computed(() => {
  if (props.dot) return true
  if (props.count === undefined || props.count === null) return false
  if (props.count === 0 && !props.showZero) return false
  return true
})

const badgeStyle = computed(() => {
  if (!props.offset) return undefined
  return { transform: `translate(calc(50% + ${props.offset[0]}px), calc(-50% + ${props.offset[1]}px))` }
})
</script>

<template>
  <span class="lumen-badge">
    <slot />
    <sup
      v-if="visible"
      class="lumen-badge__sup"
      :class="[`lumen-badge__sup--${variant}`, { 'lumen-badge__sup--dot': dot }]"
      :style="badgeStyle"
      :aria-label="ariaLabel"
      :role="ariaLabel ? 'status' : undefined"
    >
      <template v-if="!dot">{{ display }}</template>
    </sup>
  </span>
</template>

<style>
.lumen-badge {
  position: relative;
  display: inline-flex;
  font-family: var(--lumen-font-sans);
}

.lumen-badge__sup {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  border-radius: var(--lumen-radius-full);
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  color: #ffffff;
  background-color: var(--lumen-primary);
  box-shadow: 0 0 0 2px var(--lumen-surface);
}

.lumen-badge__sup--success {
  background-color: var(--lumen-success);
}
.lumen-badge__sup--warning {
  background-color: var(--lumen-warning);
}
.lumen-badge__sup--danger {
  background-color: var(--lumen-danger);
}
.lumen-badge__sup--info {
  background-color: var(--lumen-info);
}
.lumen-badge__sup--neutral {
  background-color: var(--lumen-text-muted);
}

.lumen-badge__sup--dot {
  width: 0.5rem;
  height: 0.5rem;
  min-width: 0;
  padding: 0;
}
</style>
