<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../i18n'

/**
 * Button — the primary action control.
 * Variants, sizes, loading/disabled states, icon + default slots, block layout.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonType = 'button' | 'submit' | 'reset'

export interface ButtonProps {
  /** Visual style of the button. */
  variant?: ButtonVariant
  /** Size of the button. */
  size?: ButtonSize
  /** Native button type. */
  type?: ButtonType
  /** Shows a spinner and blocks interaction. */
  loading?: boolean
  /** Disables the button. */
  disabled?: boolean
  /** Stretches the button to full width. */
  block?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
  block: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const { t } = useI18n()

const isDisabled = computed(() => props.disabled || props.loading)

function onClick(event: MouseEvent): void {
  if (isDisabled.value) return
  emit('click', event)
}
</script>

<template>
  <button
    class="lumen-btn"
    :class="[
      `lumen-btn--${variant}`,
      `lumen-btn--${size}`,
      { 'lumen-btn--block': block, 'lumen-btn--loading': loading },
    ]"
    :type="type"
    :disabled="isDisabled"
    :aria-busy="loading || undefined"
    @click="onClick"
  >
    <span v-if="loading" class="lumen-btn__spinner" role="status" :aria-label="t('button.loading')" />
    <span v-else-if="$slots.icon" class="lumen-btn__icon">
      <slot name="icon" />
    </span>
    <span v-if="$slots.default" class="lumen-btn__label">
      <slot />
    </span>
  </button>
</template>

<style>
.lumen-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: var(--lumen-font-sans);
  font-weight: 500;
  line-height: 1.25;
  border: 1px solid transparent;
  border-radius: var(--lumen-radius-md);
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease;
}
.lumen-btn:focus-visible {
  outline: none;
  box-shadow: var(--lumen-focus-ring);
}

.lumen-btn--sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}
.lumen-btn--md {
  padding: 0.5625rem 1rem;
  font-size: 0.875rem;
}
.lumen-btn--lg {
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
}

.lumen-btn--primary {
  background-color: var(--lumen-primary);
  border-color: var(--lumen-primary);
  color: var(--lumen-on-primary);
}
.lumen-btn--primary:hover:not(:disabled) {
  background-color: var(--lumen-primary-700);
  border-color: var(--lumen-primary-700);
}
.lumen-btn--primary:active:not(:disabled) {
  background-color: var(--lumen-primary-800);
  border-color: var(--lumen-primary-800);
}

.lumen-btn--secondary {
  background-color: var(--lumen-secondary);
  border-color: var(--lumen-secondary);
  color: var(--lumen-on-secondary);
}
.lumen-btn--secondary:hover:not(:disabled) {
  background-color: var(--lumen-secondary-700);
  border-color: var(--lumen-secondary-700);
}
.lumen-btn--secondary:active:not(:disabled) {
  background-color: var(--lumen-secondary-800);
  border-color: var(--lumen-secondary-800);
}

.lumen-btn--outline {
  background-color: transparent;
  border-color: var(--lumen-primary);
  color: var(--lumen-primary);
}
.lumen-btn--outline:hover:not(:disabled) {
  background-color: var(--lumen-primary-50);
}
.lumen-btn--outline:active:not(:disabled) {
  background-color: var(--lumen-primary-100);
}

.lumen-btn--ghost {
  background-color: transparent;
  border-color: transparent;
  color: var(--lumen-primary);
}
.lumen-btn--ghost:hover:not(:disabled) {
  background-color: var(--lumen-primary-50);
}
.lumen-btn--ghost:active:not(:disabled) {
  background-color: var(--lumen-primary-100);
}

.lumen-btn--danger {
  background-color: var(--lumen-danger);
  border-color: var(--lumen-danger);
  color: var(--lumen-on-danger);
}
.lumen-btn--danger:hover:not(:disabled) {
  background-color: var(--lumen-danger-700);
  border-color: var(--lumen-danger-700);
}
.lumen-btn--danger:active:not(:disabled) {
  background-color: var(--lumen-danger-800);
  border-color: var(--lumen-danger-800);
}

.lumen-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.lumen-btn--block {
  display: flex;
  width: 100%;
}

.lumen-btn__icon {
  display: inline-flex;
  align-items: center;
}

.lumen-btn__spinner {
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: var(--lumen-radius-full);
  animation: lumen-spin 0.7s linear infinite;
}

@keyframes lumen-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
