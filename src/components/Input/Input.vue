<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../i18n'

/**
 * Input — text field with v-model, prefix/suffix slots, clearable,
 * error state, and size variants.
 */

export type InputType = 'text' | 'password' | 'number' | 'email' | 'search' | 'tel' | 'url'
export type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps {
  /** Native input type. */
  type?: InputType
  /** Size variant. */
  size?: InputSize
  /** Placeholder text. */
  placeholder?: string
  /** Disables the field. */
  disabled?: boolean
  /** Read-only field. */
  readonly?: boolean
  /** Shows a clear button when the field has a value. */
  clearable?: boolean
  /** Error message — puts the field in the error state. */
  error?: string
  /** Maximum character length. */
  maxlength?: number
  /** Minimum character length. */
  minlength?: number
  /** Accessible label when no visible label is associated. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  size: 'md',
  placeholder: undefined,
  disabled: false,
  readonly: false,
  clearable: false,
  error: undefined,
  maxlength: undefined,
  minlength: undefined,
  ariaLabel: undefined,
})

const emit = defineEmits<{
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const model = defineModel<string | number>({ default: '' })

const { t } = useI18n()

let idCounter = 0
const errorId = `lumen-input-error-${++idCounter}`

const showClear = computed(
  () => props.clearable && !props.disabled && !props.readonly && String(model.value).length > 0,
)

function clear(): void {
  model.value = ''
  emit('clear')
}

function onFocus(event: FocusEvent): void {
  emit('focus', event)
}

function onBlur(event: FocusEvent): void {
  emit('blur', event)
}

defineExpose({ clear })
</script>

<template>
  <div class="lumen-input-wrap">
    <div
      class="lumen-input"
      :class="[
        `lumen-input--${size}`,
        { 'lumen-input--disabled': disabled, 'lumen-input--error': !!error },
      ]"
    >
      <span v-if="$slots.prefix" class="lumen-input__prefix">
        <slot name="prefix" />
      </span>
      <input
        v-model="model"
        class="lumen-input__inner"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :minlength="minlength"
        :aria-label="ariaLabel"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="error ? errorId : undefined"
        @focus="onFocus"
        @blur="onBlur"
      />
      <button
        v-if="showClear"
        class="lumen-input__clear"
        type="button"
        :aria-label="t('input.clear')"
        @click="clear"
      >
        <svg class="lumen-input__clear-icon" viewBox="0 0 12 12" aria-hidden="true">
          <path
            d="M2.5 2.5l7 7M9.5 2.5l-7 7"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          />
        </svg>
      </button>
      <span v-if="$slots.suffix" class="lumen-input__suffix">
        <slot name="suffix" />
      </span>
    </div>
    <p v-if="error" :id="errorId" class="lumen-input__error" role="alert">{{ error }}</p>
  </div>
</template>

<style>
.lumen-input-wrap {
  width: 100%;
}

.lumen-input {
  display: inline-flex;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
  background-color: var(--lumen-surface);
  border: 1px solid var(--lumen-border);
  border-radius: var(--lumen-radius-md);
  color: var(--lumen-text);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}
.lumen-input:hover:not(.lumen-input--disabled) {
  border-color: var(--lumen-border-strong);
}
.lumen-input:focus-within:not(.lumen-input--disabled) {
  border-color: var(--lumen-primary);
  box-shadow: var(--lumen-focus-ring);
}

.lumen-input--sm {
  padding: 0.3125rem 0.625rem;
  font-size: 0.8125rem;
}
.lumen-input--md {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
}
.lumen-input--lg {
  padding: 0.6875rem 0.875rem;
  font-size: 1rem;
}

.lumen-input--disabled {
  background-color: var(--lumen-bg-subtle);
  cursor: not-allowed;
  opacity: 0.7;
}

.lumen-input--error {
  border-color: var(--lumen-danger);
}
.lumen-input--error:focus-within {
  border-color: var(--lumen-danger);
  box-shadow: 0 0 0 3px rgb(220 38 38 / 0.18);
}

.lumen-input__inner {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  padding: 0;
  font: inherit;
  color: inherit;
}
.lumen-input__inner::placeholder {
  color: var(--lumen-text-muted);
}
.lumen-input__inner:disabled {
  cursor: not-allowed;
}

.lumen-input__prefix,
.lumen-input__suffix {
  display: inline-flex;
  align-items: center;
  color: var(--lumen-text-muted);
  flex-shrink: 0;
}

.lumen-input__clear {
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
.lumen-input__clear:hover {
  color: var(--lumen-text);
  background-color: var(--lumen-bg-subtle);
}
.lumen-input__clear-icon {
  width: 0.875em;
  height: 0.875em;
}

.lumen-input__error {
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--lumen-danger);
}
</style>
