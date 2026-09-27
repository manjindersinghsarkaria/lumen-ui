<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * Dropdown — click-triggered menu with keyboard navigation.
 * The menu renders inside the trigger wrapper (no teleport), positioned
 * with CSS per the `placement` prop.
 */

export interface DropdownItem {
  /** Visible label. */
  label: string
  /** Optional value passed back with the select event. */
  value?: string | number
  /** Optional icon key/text; rendered via the item-icon slot when provided. */
  icon?: string
  /** Disabled items cannot be focused or selected. */
  disabled?: boolean
  /** Renders a divider above the item. */
  divided?: boolean
  /** Destructive styling. */
  danger?: boolean
  /** Per-item select callback (the `select` event fires as well). */
  onSelect?: (item: DropdownItem) => void
}

export type DropdownPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'

export interface DropdownProps {
  /** Menu items. */
  items?: DropdownItem[]
  /** Where the menu appears relative to the trigger. */
  placement?: DropdownPlacement
  /** Disables the whole dropdown. */
  disabled?: boolean
}

const props = withDefaults(defineProps<DropdownProps>(), {
  items: () => [],
  placement: 'bottom-start',
  disabled: false,
})

const emit = defineEmits<{
  /** Fired when an item is chosen. */
  select: [item: DropdownItem, index: number]
}>()

const open = defineModel<boolean>('open', { default: false })

const wrapperRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const itemEls = ref<HTMLElement[]>([])
const focusedIndex = ref(-1)

const enabledIndices = computed(() =>
  props.items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0),
)

function setItemEl(el: unknown, index: number): void {
  if (el instanceof HTMLElement) itemEls.value[index] = el
}

function openMenu(focusFirst = false): void {
  if (props.disabled) return
  open.value = true
  focusedIndex.value = -1
  if (focusFirst) {
    void nextTick(() => moveFocus(1))
  }
}

function closeMenu(refocusTrigger = false): void {
  open.value = false
  focusedIndex.value = -1
  if (refocusTrigger) triggerRef.value?.focus()
}

function toggle(): void {
  if (open.value) closeMenu()
  else openMenu()
}

function focusItem(index: number): void {
  focusedIndex.value = index
  itemEls.value[index]?.focus()
}

function moveFocus(direction: 1 | -1): void {
  const ids = enabledIndices.value
  if (ids.length === 0) return
  const pos = ids.indexOf(focusedIndex.value)
  const next =
    pos === -1
      ? direction === 1
        ? 0
        : ids.length - 1
      : (pos + direction + ids.length) % ids.length
  focusItem(ids[next])
}

function selectItem(item: DropdownItem, index: number): void {
  if (item.disabled || props.disabled) return
  emit('select', item, index)
  item.onSelect?.(item)
  closeMenu(true)
}

function onTriggerClick(): void {
  toggle()
}

function onTriggerKeydown(event: KeyboardEvent): void {
  if (props.disabled) return
  if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (!open.value) openMenu(true)
    else if (event.key !== ' ') toggle()
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (!open.value) {
      openMenu()
      void nextTick(() => moveFocus(-1))
    }
  }
}

function onMenuKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      moveFocus(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      moveFocus(-1)
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (focusedIndex.value >= 0) {
        selectItem(props.items[focusedIndex.value], focusedIndex.value)
      }
      break
    case 'Escape':
      event.preventDefault()
      closeMenu(true)
      break
    case 'Tab':
      closeMenu()
      break
  }
}

function onDocumentClick(event: MouseEvent): void {
  if (!open.value) return
  const el = wrapperRef.value
  if (el && !el.contains(event.target as Node)) closeMenu()
}

function onDocumentKeydown(event: KeyboardEvent): void {
  if (open.value && event.key === 'Escape') closeMenu(true)
}

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) closeMenu()
  },
)

watch(open, (isOpen) => {
  if (!isOpen) focusedIndex.value = -1
})

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
})

defineExpose({ openMenu, closeMenu, toggle })
</script>

<template>
  <span ref="wrapperRef" class="lumen-dropdown">
    <span
      ref="triggerRef"
      class="lumen-dropdown__trigger"
      :class="{ 'lumen-dropdown__trigger--disabled': disabled }"
      role="button"
      tabindex="0"
      aria-haspopup="menu"
      :aria-expanded="open"
      :aria-disabled="disabled || undefined"
      @click="onTriggerClick"
      @keydown="onTriggerKeydown"
    >
      <slot />
    </span>
    <div
      v-if="open"
      class="lumen-dropdown__menu"
      :class="`lumen-dropdown__menu--${placement}`"
      role="menu"
      @keydown="onMenuKeydown"
    >
      <template v-for="(item, index) in items" :key="index">
        <div v-if="item.divided && index > 0" class="lumen-dropdown__divider" role="separator" />
        <button
          :ref="(el) => setItemEl(el, index)"
          type="button"
          class="lumen-dropdown__item"
          :class="{
            'lumen-dropdown__item--danger': item.danger,
            'lumen-dropdown__item--focused': focusedIndex === index,
          }"
          role="menuitem"
          :disabled="item.disabled"
          @click="selectItem(item, index)"
          @mouseenter="focusedIndex = item.disabled ? focusedIndex : index"
        >
          <span v-if="item.icon || $slots['item-icon']" class="lumen-dropdown__item-icon">
            <slot name="item-icon" :item="item">{{ item.icon }}</slot>
          </span>
          <span class="lumen-dropdown__item-label">{{ item.label }}</span>
        </button>
      </template>
      <div v-if="items.length === 0" class="lumen-dropdown__empty">
        <slot name="empty">No items</slot>
      </div>
    </div>
  </span>
</template>

<style>
.lumen-dropdown {
  position: relative;
  display: inline-block;
}

.lumen-dropdown__trigger {
  display: inline-block;
  cursor: pointer;
}
.lumen-dropdown__trigger:focus-visible {
  outline: none;
  box-shadow: var(--lumen-focus-ring);
  border-radius: var(--lumen-radius-sm);
}
.lumen-dropdown__trigger--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.lumen-dropdown__menu {
  position: absolute;
  z-index: var(--lumen-z-dropdown);
  min-width: 10rem;
  padding: 0.375rem;
  border: 1px solid var(--lumen-border);
  border-radius: var(--lumen-radius-md);
  background-color: var(--lumen-surface);
  box-shadow: var(--lumen-shadow-lg);
  font-family: var(--lumen-font-sans);
}
.lumen-dropdown__menu--bottom-start {
  top: 100%;
  left: 0;
  margin-top: 0.375rem;
}
.lumen-dropdown__menu--bottom-end {
  top: 100%;
  right: 0;
  margin-top: 0.375rem;
}
.lumen-dropdown__menu--top-start {
  bottom: 100%;
  left: 0;
  margin-bottom: 0.375rem;
}
.lumen-dropdown__menu--top-end {
  bottom: 100%;
  right: 0;
  margin-bottom: 0.375rem;
}

.lumen-dropdown__item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: var(--lumen-radius-sm);
  background: transparent;
  color: var(--lumen-text);
  font-size: 0.875rem;
  line-height: 1.4;
  text-align: left;
  cursor: pointer;
}
.lumen-dropdown__item:hover,
.lumen-dropdown__item--focused {
  background-color: var(--lumen-bg-subtle);
}
.lumen-dropdown__item:focus-visible {
  outline: none;
  box-shadow: var(--lumen-focus-ring);
}
.lumen-dropdown__item:disabled {
  color: var(--lumen-text-muted);
  cursor: not-allowed;
  background: transparent;
}
.lumen-dropdown__item--danger {
  color: var(--lumen-danger);
}
.lumen-dropdown__item--danger:hover,
.lumen-dropdown__item--danger.lumen-dropdown__item--focused {
  background-color: color-mix(in srgb, var(--lumen-danger) 10%, transparent);
}

.lumen-dropdown__item-icon {
  display: inline-flex;
  flex-shrink: 0;
  color: var(--lumen-text-muted);
}
.lumen-dropdown__item--danger .lumen-dropdown__item-icon {
  color: inherit;
}

.lumen-dropdown__item-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lumen-dropdown__divider {
  height: 1px;
  margin: 0.375rem 0.25rem;
  background-color: var(--lumen-border);
}

.lumen-dropdown__empty {
  padding: 0.75rem;
  color: var(--lumen-text-muted);
  font-size: 0.8125rem;
  text-align: center;
}
</style>
