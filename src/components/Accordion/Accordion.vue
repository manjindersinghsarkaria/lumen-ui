<script setup lang="ts">
import { ref } from 'vue'

/**
 * Accordion — stacked collapsible sections.
 * v-model holds the array of open item keys. With `accordion`, only one
 * section can be open at a time.
 */

export interface AccordionItem {
  /** Unique key tracked in v-model. */
  key: string | number
  /** Header title (the title slot takes precedence). */
  title: string
  /** Disabled sections cannot be toggled. */
  disabled?: boolean
}

export type AccordionIconPosition = 'left' | 'right'

export interface AccordionProps {
  /** Sections to render. */
  items?: AccordionItem[]
  /** Single-open mode: opening a section closes the others. */
  accordion?: boolean
  /** Which side the expand icon sits on. */
  expandIconPosition?: AccordionIconPosition
}

const props = withDefaults(defineProps<AccordionProps>(), {
  items: () => [],
  accordion: false,
  expandIconPosition: 'right',
})

const emit = defineEmits<{
  /** Fired when the open-keys array changes. */
  change: [keys: Array<string | number>]
}>()

/** Keys of the currently open sections. */
const activeKeys = defineModel<Array<string | number>>({ default: [] })

const headerEls = ref<HTMLElement[]>([])

function setHeaderEl(el: unknown, index: number): void {
  if (el instanceof HTMLElement) headerEls.value[index] = el
}

function isOpen(key: string | number): boolean {
  return activeKeys.value.includes(key)
}

function toggle(item: AccordionItem): void {
  if (item.disabled) return
  const open = isOpen(item.key)
  let next: Array<string | number>
  if (props.accordion) {
    next = open ? [] : [item.key]
  } else if (open) {
    next = activeKeys.value.filter((k) => k !== item.key)
  } else {
    next = [...activeKeys.value, item.key]
  }
  activeKeys.value = next
  emit('change', next)
}

function onHeaderKeydown(event: KeyboardEvent, index: number): void {
  const enabled = props.items
    .map((item, i) => (item.disabled ? -1 : i))
    .filter((i) => i >= 0)
  if (enabled.length === 0) return
  let target: number | undefined
  switch (event.key) {
    case 'ArrowDown':
      target = enabled[(enabled.indexOf(index) + 1) % enabled.length]
      break
    case 'ArrowUp':
      target =
        enabled[(enabled.indexOf(index) - 1 + enabled.length) % enabled.length]
      break
    case 'Home':
      target = enabled[0]
      break
    case 'End':
      target = enabled[enabled.length - 1]
      break
  }
  if (target !== undefined) {
    event.preventDefault()
    headerEls.value[target]?.focus()
  }
}
</script>

<template>
  <div
    class="lumen-accordion"
    :class="`lumen-accordion--icon-${expandIconPosition}`"
  >
    <div
      v-for="(item, index) in items"
      :key="item.key"
      class="lumen-accordion__item"
      :class="{ 'lumen-accordion__item--open': isOpen(item.key) }"
    >
      <h3 class="lumen-accordion__heading">
        <button
          :ref="(el) => setHeaderEl(el, index)"
          type="button"
          class="lumen-accordion__header"
          :aria-expanded="isOpen(item.key)"
          :aria-controls="`lumen-accordion-panel-${item.key}`"
          :id="`lumen-accordion-header-${item.key}`"
          :disabled="item.disabled"
          @click="toggle(item)"
          @keydown="onHeaderKeydown($event, index)"
        >
          <span
            class="lumen-accordion__icon"
            aria-hidden="true"
          >
            <svg viewBox="0 0 16 16" class="lumen-accordion__icon-svg">
              <path
                d="M4 6l4 4 4-4"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="lumen-accordion__title">
            <slot name="title" :item="item" :index="index" :open="isOpen(item.key)">
              {{ item.title }}
            </slot>
          </span>
        </button>
      </h3>
      <div
        v-show="isOpen(item.key)"
        :id="`lumen-accordion-panel-${item.key}`"
        class="lumen-accordion__panel"
        role="region"
        :aria-labelledby="`lumen-accordion-header-${item.key}`"
      >
        <div class="lumen-accordion__content">
          <slot name="content" :item="item" :index="index" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.lumen-accordion {
  border: 1px solid var(--lumen-border);
  border-radius: var(--lumen-radius-md);
  background-color: var(--lumen-surface);
  font-family: var(--lumen-font-sans);
  overflow: hidden;
}

.lumen-accordion__item + .lumen-accordion__item {
  border-top: 1px solid var(--lumen-border);
}

.lumen-accordion__heading {
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
}

.lumen-accordion__header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.875rem 1rem;
  border: none;
  background: transparent;
  color: var(--lumen-text);
  font-size: 0.9375rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}
.lumen-accordion__header:hover:not(:disabled) {
  background-color: var(--lumen-bg-subtle);
}
.lumen-accordion__header:focus-visible {
  outline: none;
  box-shadow: inset var(--lumen-focus-ring);
}
.lumen-accordion__header:disabled {
  color: var(--lumen-text-muted);
  cursor: not-allowed;
}

.lumen-accordion--icon-left .lumen-accordion__icon {
  order: 0;
}
.lumen-accordion--icon-left .lumen-accordion__title {
  order: 1;
}
.lumen-accordion--icon-right .lumen-accordion__icon {
  order: 1;
  margin-left: auto;
}
.lumen-accordion--icon-right .lumen-accordion__title {
  order: 0;
}

.lumen-accordion__icon {
  display: inline-flex;
  flex-shrink: 0;
  color: var(--lumen-text-muted);
  transition: transform 0.15s ease-in-out;
}
.lumen-accordion__item--open .lumen-accordion__icon {
  transform: rotate(180deg);
}
.lumen-accordion__icon-svg {
  width: 1rem;
  height: 1rem;
}

.lumen-accordion__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lumen-accordion__panel {
  border-top: 1px solid var(--lumen-border);
}

.lumen-accordion__content {
  padding: 1rem;
  color: var(--lumen-text);
  font-size: 0.875rem;
  line-height: 1.6;
}
</style>
