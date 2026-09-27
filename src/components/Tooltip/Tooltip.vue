<script lang="ts">
// Module-scope counter so each tooltip gets a stable unique id for aria-describedby.
let tooltipCounter = 0
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'

/**
 * Tooltip — hover/focus/click popup hint anchored to a trigger element.
 * The tooltip renders inside the wrapper (no teleport), positioned with CSS
 * per the `placement` prop.
 */

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'
export type TooltipTrigger = 'hover' | 'focus' | 'click'

export interface TooltipProps {
  /** Tooltip text (the content slot takes precedence). */
  content?: string
  /** Where the tooltip appears relative to the trigger. */
  placement?: TooltipPlacement
  /** Which interaction(s) toggle the tooltip. */
  trigger?: TooltipTrigger | TooltipTrigger[]
  /** Delay before showing, in ms. */
  showDelay?: number
  /** Delay before hiding, in ms. */
  hideDelay?: number
  /** Disables the tooltip entirely. */
  disabled?: boolean
}

const props = withDefaults(defineProps<TooltipProps>(), {
  content: undefined,
  placement: 'top',
  trigger: 'hover',
  showDelay: 0,
  hideDelay: 0,
  disabled: false,
})

const slots = useSlots()
const tooltipId = `lumen-tooltip-${++tooltipCounter}`

const wrapperRef = ref<HTMLElement | null>(null)
const visible = ref(false)

const triggers = computed(
  () => new Set<TooltipTrigger>(Array.isArray(props.trigger) ? props.trigger : [props.trigger]),
)
const hasContent = computed(() => props.content !== undefined || !!slots.content)

let showTimer: ReturnType<typeof setTimeout> | undefined
let hideTimer: ReturnType<typeof setTimeout> | undefined

function clearTimers(): void {
  if (showTimer !== undefined) {
    clearTimeout(showTimer)
    showTimer = undefined
  }
  if (hideTimer !== undefined) {
    clearTimeout(hideTimer)
    hideTimer = undefined
  }
}

function show(): void {
  if (props.disabled || !hasContent.value) return
  clearTimers()
  if (props.showDelay > 0) {
    showTimer = setTimeout(() => {
      visible.value = true
    }, props.showDelay)
  } else {
    visible.value = true
  }
}

function hide(): void {
  clearTimers()
  if (props.hideDelay > 0) {
    hideTimer = setTimeout(() => {
      visible.value = false
    }, props.hideDelay)
  } else {
    visible.value = false
  }
}

function toggle(): void {
  if (visible.value) hide()
  else show()
}

function onMouseEnter(): void {
  if (triggers.value.has('hover')) show()
}
function onMouseLeave(): void {
  if (triggers.value.has('hover')) hide()
}
function onFocusIn(): void {
  if (triggers.value.has('focus')) show()
}
function onFocusOut(): void {
  if (triggers.value.has('focus')) hide()
}
function onClick(): void {
  if (triggers.value.has('click')) toggle()
}

function onDocumentClick(event: MouseEvent): void {
  if (!visible.value || !triggers.value.has('click')) return
  const el = wrapperRef.value
  if (el && !el.contains(event.target as Node)) hide()
}

function onDocumentKeydown(event: KeyboardEvent): void {
  if (visible.value && event.key === 'Escape') hide()
}

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) {
      clearTimers()
      visible.value = false
    }
  },
)

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onDocumentKeydown)
})

onBeforeUnmount(() => {
  clearTimers()
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
})

defineExpose({ show, hide, toggle })
</script>

<template>
  <span
    ref="wrapperRef"
    class="lumen-tooltip-wrapper"
    :aria-describedby="visible ? tooltipId : undefined"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
    @click="onClick"
  >
    <slot />
    <div
      v-if="visible"
      :id="tooltipId"
      class="lumen-tooltip"
      :class="`lumen-tooltip--${placement}`"
      role="tooltip"
    >
      <slot name="content">{{ content }}</slot>
    </div>
  </span>
</template>

<style>
.lumen-tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.lumen-tooltip {
  position: absolute;
  z-index: var(--lumen-z-tooltip);
  max-width: 16rem;
  padding: 0.375rem 0.625rem;
  border-radius: var(--lumen-radius-md);
  background-color: var(--lumen-text);
  color: var(--lumen-text-inverse);
  font-family: var(--lumen-font-sans);
  font-size: 0.75rem;
  line-height: 1.4;
  white-space: normal;
  overflow-wrap: break-word;
  box-shadow: var(--lumen-shadow-md);
  pointer-events: none;
}

.lumen-tooltip--top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 0.5rem;
}
.lumen-tooltip--bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 0.5rem;
}
.lumen-tooltip--left {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 0.5rem;
}
.lumen-tooltip--right {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 0.5rem;
}

.lumen-tooltip::after {
  content: '';
  position: absolute;
  width: 0.5rem;
  height: 0.5rem;
  background-color: inherit;
  transform: rotate(45deg);
}
.lumen-tooltip--top::after {
  top: 100%;
  left: 50%;
  margin-top: -0.25rem;
  margin-left: -0.25rem;
}
.lumen-tooltip--bottom::after {
  bottom: 100%;
  left: 50%;
  margin-bottom: -0.25rem;
  margin-left: -0.25rem;
}
.lumen-tooltip--left::after {
  left: 100%;
  top: 50%;
  margin-left: -0.25rem;
  margin-top: -0.25rem;
}
.lumen-tooltip--right::after {
  right: 100%;
  top: 50%;
  margin-right: -0.25rem;
  margin-top: -0.25rem;
}
</style>
