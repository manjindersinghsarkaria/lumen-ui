<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from '../../i18n'

/**
 * Select — single-value dropdown with searchable filter, clearable,
 * keyboard navigation, and disabled state.
 */

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectProps {
  /** Available options. */
  options?: SelectOption[]
  /** Size variant. */
  size?: SelectSize
  /** Placeholder shown when nothing is selected (i18n default). */
  placeholder?: string
  /** Disables the control. */
  disabled?: boolean
  /** Shows a clear button when a value is selected. */
  clearable?: boolean
  /** Shows a filter input inside the dropdown. */
  searchable?: boolean
  /** Error message — puts the control in the error state. */
  error?: string
  /** Accessible label for the combobox. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<SelectProps>(), {
  options: () => [],
  size: 'md',
  placeholder: undefined,
  disabled: false,
  clearable: false,
  searchable: false,
  error: undefined,
  ariaLabel: undefined,
})

const emit = defineEmits<{
  change: [value: string | number | null]
  open: []
  close: []
}>()

const model = defineModel<string | number | null>({ default: null })

const { t } = useI18n()

let selectIdCounter = 0
const listId = `lumen-select-list-${++selectIdCounter}`

const root = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const open = ref(false)
const search = ref('')
const activeIndex = ref(-1)

const effectivePlaceholder = computed(() => props.placeholder ?? t('select.placeholder'))

const filteredOptions = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter((o) => o.label.toLowerCase().includes(q))
})

const selectedOption = computed(
  () => props.options.find((o) => o.value === model.value) ?? null,
)

const showClear = computed(
  () =>
    props.clearable &&
    !props.disabled &&
    model.value !== null &&
    model.value !== undefined &&
    model.value !== '',
)

const activeDescendantId = computed(() =>
  open.value && activeIndex.value >= 0 ? `${listId}-opt-${activeIndex.value}` : undefined,
)

function firstEnabledIndex(): number {
  return filteredOptions.value.findIndex((o) => !o.disabled)
}

function openPanel(): void {
  if (props.disabled || open.value) return
  open.value = true
  search.value = ''
  const selected = filteredOptions.value.findIndex((o) => o.value === model.value && !o.disabled)
  activeIndex.value = selected >= 0 ? selected : firstEnabledIndex()
  emit('open')
  if (props.searchable) {
    void nextTick(() => searchInput.value?.focus())
  }
}

function closePanel(): void {
  if (!open.value) return
  open.value = false
  search.value = ''
  activeIndex.value = -1
  emit('close')
}

function toggle(): void {
  if (open.value) closePanel()
  else openPanel()
}

function moveActive(delta: 1 | -1): void {
  const opts = filteredOptions.value
  if (opts.length === 0) return
  let i = activeIndex.value
  for (let n = 0; n < opts.length; n++) {
    i = (i + delta + opts.length) % opts.length
    if (!opts[i].disabled) break
  }
  activeIndex.value = i
}

function selectOption(option: SelectOption): void {
  if (option.disabled) return
  model.value = option.value
  emit('change', option.value)
  closePanel()
}

function clearSelection(event: MouseEvent): void {
  event.stopPropagation()
  model.value = null
  emit('change', null)
}

function onKeydown(event: KeyboardEvent): void {
  if (props.disabled) return
  const target = event.target as HTMLElement | null
  const onTrigger = target === triggerRef.value
  switch (event.key) {
    case 'Enter':
      event.preventDefault()
      if (!open.value) {
        openPanel()
      } else {
        const opt = filteredOptions.value[activeIndex.value]
        if (opt && !opt.disabled) selectOption(opt)
      }
      break
    case ' ':
      // Space toggles only when the trigger itself is focused (never inside search).
      if (onTrigger && !open.value) {
        event.preventDefault()
        openPanel()
      }
      break
    case 'ArrowDown':
      event.preventDefault()
      if (!open.value) openPanel()
      else moveActive(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      if (open.value) moveActive(-1)
      break
    case 'Escape':
      if (open.value) {
        event.preventDefault()
        closePanel()
        triggerRef.value?.focus()
      }
      break
  }
}

function onDocumentPointerDown(event: Event): void {
  if (root.value && !root.value.contains(event.target as Node)) {
    closePanel()
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
})
onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})
</script>

<template>
  <div
    ref="root"
    class="lumen-select"
    :class="[
      `lumen-select--${size}`,
      {
        'lumen-select--disabled': disabled,
        'lumen-select--error': !!error,
        'lumen-select--open': open,
      },
    ]"
    @keydown="onKeydown"
  >
    <div
      ref="triggerRef"
      class="lumen-select__trigger"
      role="combobox"
      :tabindex="disabled ? -1 : 0"
      :aria-expanded="open"
      :aria-controls="listId"
      :aria-activedescendant="activeDescendantId"
      :aria-disabled="disabled || undefined"
      :aria-label="ariaLabel"
      @click="toggle"
    >
      <span
        class="lumen-select__value"
        :class="{ 'lumen-select__placeholder': !selectedOption }"
      >
        {{ selectedOption ? selectedOption.label : effectivePlaceholder }}
      </span>
      <button
        v-if="showClear"
        class="lumen-select__clear"
        type="button"
        :aria-label="t('select.clear')"
        @click="clearSelection"
      >
        <svg class="lumen-select__clear-icon" viewBox="0 0 12 12" aria-hidden="true">
          <path
            d="M2.5 2.5l7 7M9.5 2.5l-7 7"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          />
        </svg>
      </button>
      <svg
        class="lumen-select__chevron"
        viewBox="0 0 16 16"
        aria-hidden="true"
        width="16"
        height="16"
      >
        <path
          d="M4 6l4 4 4-4"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <div v-if="open" :id="listId" class="lumen-select__panel">
      <div v-if="searchable" class="lumen-select__search-wrap">
        <input
          ref="searchInput"
          v-model="search"
          class="lumen-select__search"
          type="text"
          :placeholder="t('select.search')"
          :aria-label="t('select.search')"
        />
      </div>
      <ul class="lumen-select__list" role="listbox" :aria-label="ariaLabel ?? effectivePlaceholder">
        <li
          v-for="(option, i) in filteredOptions"
          :id="`${listId}-opt-${i}`"
          :key="String(option.value)"
          class="lumen-select__option"
          :class="{
            'lumen-select__option--selected': option.value === model,
            'lumen-select__option--disabled': option.disabled,
            'lumen-select__option--active': i === activeIndex,
          }"
          role="option"
          :aria-selected="option.value === model"
          :aria-disabled="option.disabled || undefined"
          @click="selectOption(option)"
          @mousemove="activeIndex = i"
        >
          {{ option.label }}
        </li>
      </ul>
      <p v-if="filteredOptions.length === 0" class="lumen-select__empty">
        {{ t('select.noOptions') }}
      </p>
    </div>

    <p v-if="error" class="lumen-select__error" role="alert">{{ error }}</p>
  </div>
</template>

<style>
.lumen-select {
  position: relative;
  width: 100%;
  font-family: var(--lumen-font-sans);
}

.lumen-select__trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--lumen-surface);
  border: 1px solid var(--lumen-border);
  border-radius: var(--lumen-radius-md);
  color: var(--lumen-text);
  cursor: pointer;
  user-select: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}
.lumen-select__trigger:hover {
  border-color: var(--lumen-border-strong);
}
.lumen-select__trigger:focus-visible {
  outline: none;
  border-color: var(--lumen-primary);
  box-shadow: var(--lumen-focus-ring);
}
.lumen-select--open .lumen-select__trigger {
  border-color: var(--lumen-primary);
  box-shadow: var(--lumen-focus-ring);
}

.lumen-select--sm .lumen-select__trigger {
  padding: 0.3125rem 0.625rem;
  font-size: 0.8125rem;
}
.lumen-select--md .lumen-select__trigger {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}
.lumen-select--lg .lumen-select__trigger {
  padding: 0.6875rem 0.875rem;
  font-size: 1rem;
}

.lumen-select__value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}
.lumen-select__placeholder {
  color: var(--lumen-text-muted);
}

.lumen-select__chevron {
  flex-shrink: 0;
  color: var(--lumen-text-muted);
  transition: transform 0.15s ease;
}
.lumen-select--open .lumen-select__chevron {
  transform: rotate(180deg);
}

.lumen-select__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0.125rem;
  border: none;
  border-radius: var(--lumen-radius-full);
  background: transparent;
  color: var(--lumen-text-muted);
  cursor: pointer;
}
.lumen-select__clear:hover {
  color: var(--lumen-text);
  background-color: var(--lumen-bg-subtle);
}
.lumen-select__clear-icon {
  width: 0.875em;
  height: 0.875em;
}

.lumen-select__panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: var(--lumen-z-dropdown);
  background-color: var(--lumen-surface);
  border: 1px solid var(--lumen-border);
  border-radius: var(--lumen-radius-md);
  box-shadow: var(--lumen-shadow-lg);
  overflow: hidden;
}

.lumen-select__search-wrap {
  padding: 0.5rem;
  border-bottom: 1px solid var(--lumen-border);
}
.lumen-select__search {
  width: 100%;
  box-sizing: border-box;
  padding: 0.375rem 0.625rem;
  font: inherit;
  font-size: 0.875rem;
  color: var(--lumen-text);
  background-color: var(--lumen-bg-subtle);
  border: 1px solid var(--lumen-border);
  border-radius: var(--lumen-radius-sm);
}
.lumen-select__search:focus {
  outline: none;
  border-color: var(--lumen-primary);
}
.lumen-select__search::placeholder {
  color: var(--lumen-text-muted);
}

.lumen-select__list {
  list-style: none;
  margin: 0;
  padding: 0.25rem;
  max-height: 12rem;
  overflow-y: auto;
}

.lumen-select__option {
  padding: 0.5rem 0.75rem;
  border-radius: var(--lumen-radius-sm);
  font-size: 0.875rem;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lumen-select__option--active {
  background-color: color-mix(in srgb, var(--lumen-primary) 10%, transparent);
}
.lumen-select__option--selected {
  color: var(--lumen-primary);
  font-weight: 600;
}
.lumen-select__option--disabled {
  color: var(--lumen-text-muted);
  cursor: not-allowed;
  opacity: 0.6;
}

.lumen-select__empty {
  margin: 0;
  padding: 0.75rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--lumen-text-muted);
}

.lumen-select--disabled .lumen-select__trigger {
  background-color: var(--lumen-bg-subtle);
  cursor: not-allowed;
  opacity: 0.7;
}

.lumen-select--error .lumen-select__trigger {
  border-color: var(--lumen-danger);
}
.lumen-select__error {
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--lumen-danger);
}
</style>
