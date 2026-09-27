<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../i18n'

/**
 * Tabs — tabbed navigation with line/card variants, keyboard support,
 * closable tabs, and an optional panel slot for the active tab's content.
 */

export interface TabItem {
  /** Unique key bound to v-model. */
  key: string | number
  /** Tab label (the tab slot takes precedence). */
  label: string
  /** Disabled tabs cannot be activated or focused. */
  disabled?: boolean
  /** Per-tab closable override (falls back to the `closable` prop). */
  closable?: boolean
}

export type TabsVariant = 'line' | 'card'

export interface TabsProps {
  /** Tabs to render. */
  items?: TabItem[]
  /** Visual style. */
  variant?: TabsVariant
  /** Shows a close button on every tab (unless the item overrides it). */
  closable?: boolean
  /** Accessible label for close buttons (i18n-able; defaults to t('tabs.close')). */
  closeLabel?: string
}

const props = withDefaults(defineProps<TabsProps>(), {
  items: () => [],
  variant: 'line',
  closable: false,
  closeLabel: undefined,
})

const emit = defineEmits<{
  /** Fired when a tab's close button is clicked. */
  close: [item: TabItem, index: number]
  /** Fired when the active tab changes. */
  change: [key: string | number]
}>()

/** The active tab's key. */
const activeKey = defineModel<string | number>({ default: undefined })

const { t } = useI18n()

const enabledIndices = computed(() =>
  props.items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0),
)

const activeItem = computed(() => props.items.find((item) => item.key === activeKey.value))

const activeIndex = computed(() => props.items.findIndex((item) => item.key === activeKey.value))

function isClosable(item: TabItem): boolean {
  return item.closable ?? props.closable
}

function activate(item: TabItem): void {
  if (item.disabled) return
  if (activeKey.value !== item.key) {
    activeKey.value = item.key
    emit('change', item.key)
  }
}

function closeTab(item: TabItem, index: number, event: MouseEvent): void {
  event.stopPropagation()
  if (item.disabled) return
  emit('close', item, index)
}

function moveActive(direction: 1 | -1): void {
  const ids = enabledIndices.value
  if (ids.length === 0) return
  const pos = ids.indexOf(activeIndex.value)
  const next =
    pos === -1
      ? direction === 1
        ? 0
        : ids.length - 1
      : (pos + direction + ids.length) % ids.length
  activate(props.items[ids[next]])
}

function onTablistKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault()
      moveActive(1)
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault()
      moveActive(-1)
      break
    case 'Home':
      event.preventDefault()
      if (enabledIndices.value.length > 0) activate(props.items[enabledIndices.value[0]])
      break
    case 'End':
      event.preventDefault()
      if (enabledIndices.value.length > 0)
        activate(props.items[enabledIndices.value[enabledIndices.value.length - 1]])
      break
  }
}
</script>

<template>
  <div class="lumen-tabs" :class="`lumen-tabs--${variant}`">
    <div class="lumen-tabs__header">
      <div
        class="lumen-tabs__tablist"
        role="tablist"
        :aria-label="t('tabs.list')"
        @keydown="onTablistKeydown"
      >
        <button
          v-for="(item, index) in items"
          :key="item.key"
          type="button"
          class="lumen-tabs__tab"
          :class="{
            'lumen-tabs__tab--active': item.key === activeKey,
            'lumen-tabs__tab--disabled': item.disabled,
          }"
          role="tab"
          :aria-selected="item.key === activeKey"
          :aria-disabled="item.disabled || undefined"
          :tabindex="item.key === activeKey ? 0 : -1"
          :disabled="item.disabled"
          @click="activate(item)"
        >
          <span class="lumen-tabs__tab-label">
            <slot name="tab" :item="item" :index="index">{{ item.label }}</slot>
          </span>
          <span
            v-if="isClosable(item)"
            class="lumen-tabs__close"
            role="button"
            tabindex="-1"
            :aria-label="closeLabel ?? t('tabs.close')"
            @click="closeTab(item, index, $event)"
          >
            <svg viewBox="0 0 16 16" class="lumen-tabs__close-svg" aria-hidden="true">
              <path
                d="M4 4l8 8M12 4l-8 8"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </span>
        </button>
      </div>
      <div v-if="$slots.extra" class="lumen-tabs__extra">
        <slot name="extra" />
      </div>
    </div>
    <div
      v-if="$slots.panel"
      class="lumen-tabs__panel"
      role="tabpanel"
      :aria-label="activeItem?.label"
    >
      <slot name="panel" :item="activeItem" :key-value="activeKey" />
    </div>
  </div>
</template>

<style>
.lumen-tabs {
  font-family: var(--lumen-font-sans);
}

.lumen-tabs__header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.lumen-tabs__tablist {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
}

.lumen-tabs__tab {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 0.875rem;
  border: none;
  background: transparent;
  color: var(--lumen-text-muted);
  font-size: 0.875rem;
  line-height: 1.4;
  white-space: nowrap;
  cursor: pointer;
}
.lumen-tabs__tab:hover:not(:disabled) {
  color: var(--lumen-text);
}
.lumen-tabs__tab:focus-visible {
  outline: none;
  box-shadow: var(--lumen-focus-ring);
  border-radius: var(--lumen-radius-sm);
}
.lumen-tabs__tab:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.lumen-tabs__tab--active {
  color: var(--lumen-primary-600);
  font-weight: 600;
}

/* line variant */
.lumen-tabs--line .lumen-tabs__tablist {
  border-bottom: 1px solid var(--lumen-border);
}
.lumen-tabs--line .lumen-tabs__tab {
  margin-bottom: -1px;
  border-bottom: 2px solid transparent;
}
.lumen-tabs--line .lumen-tabs__tab--active {
  border-bottom-color: var(--lumen-primary-600);
}

/* card variant */
.lumen-tabs--card .lumen-tabs__tab {
  border: 1px solid var(--lumen-border);
  border-bottom: none;
  border-radius: var(--lumen-radius-md) var(--lumen-radius-md) 0 0;
  background-color: var(--lumen-bg-subtle);
}
.lumen-tabs--card .lumen-tabs__tab--active {
  background-color: var(--lumen-surface);
  border-bottom: 1px solid var(--lumen-surface);
  margin-bottom: -1px;
}
.lumen-tabs--card .lumen-tabs__tablist {
  border-bottom: 1px solid var(--lumen-border);
}

.lumen-tabs__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: var(--lumen-radius-sm);
  color: var(--lumen-text-muted);
  cursor: pointer;
}
.lumen-tabs__close:hover {
  background-color: color-mix(in srgb, var(--lumen-text) 10%, transparent);
  color: var(--lumen-text);
}
.lumen-tabs__close-svg {
  width: 0.625rem;
  height: 0.625rem;
}

.lumen-tabs__extra {
  flex-shrink: 0;
  margin-left: auto;
}

.lumen-tabs__panel {
  padding: 1rem 0;
  color: var(--lumen-text);
}
.lumen-tabs--card .lumen-tabs__panel {
  border: 1px solid var(--lumen-border);
  border-top: none;
  border-radius: 0 0 var(--lumen-radius-md) var(--lumen-radius-md);
  padding: 1rem;
}
</style>
