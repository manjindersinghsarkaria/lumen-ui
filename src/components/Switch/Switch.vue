<script setup lang="ts">
/**
 * Switch — boolean toggle with sizes, loading state, and optional
 * checked/unchecked labels (pass translated strings for i18n).
 */

export type SwitchSize = 'sm' | 'md' | 'lg'

export interface SwitchProps {
  /** Size variant. */
  size?: SwitchSize
  /** Disables the switch. */
  disabled?: boolean
  /** Shows a spinner and blocks interaction. */
  loading?: boolean
  /** Label shown when on (i18n-able: pass a translated string). */
  checkedLabel?: string
  /** Label shown when off (i18n-able: pass a translated string). */
  uncheckedLabel?: string
  /** Accessible label for the switch. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<SwitchProps>(), {
  size: 'md',
  disabled: false,
  loading: false,
  checkedLabel: undefined,
  uncheckedLabel: undefined,
  ariaLabel: undefined,
})

const emit = defineEmits<{
  change: [value: boolean]
}>()

const model = defineModel<boolean>({ default: false })

function toggle(): void {
  if (props.disabled || props.loading) return
  model.value = !model.value
  emit('change', model.value)
}
</script>

<template>
  <button
    type="button"
    role="switch"
    class="lumen-switch"
    :class="[
      `lumen-switch--${size}`,
      {
        'lumen-switch--on': model,
        'lumen-switch--disabled': disabled || loading,
      },
    ]"
    :aria-checked="model"
    :aria-label="ariaLabel"
    :disabled="disabled || loading"
    @click="toggle"
  >
    <span class="lumen-switch__track" aria-hidden="true">
      <span v-if="loading" class="lumen-switch__spinner" />
      <span v-else class="lumen-switch__thumb" />
    </span>
    <span v-if="model ? checkedLabel : uncheckedLabel" class="lumen-switch__label">
      {{ model ? checkedLabel : uncheckedLabel }}
    </span>
  </button>
</template>

<style>
.lumen-switch {
  --sw-w: 2.25rem;
  --sw-h: 1.25rem;
  --sw-thumb: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  background: none;
  border: none;
  font-family: var(--lumen-font-sans);
  font-size: 0.875rem;
  color: var(--lumen-text);
  cursor: pointer;
  user-select: none;
}
.lumen-switch--sm {
  --sw-w: 1.75rem;
  --sw-h: 1rem;
  --sw-thumb: 0.75rem;
  font-size: 0.8125rem;
}
.lumen-switch--lg {
  --sw-w: 2.75rem;
  --sw-h: 1.5rem;
  --sw-thumb: 1.25rem;
  font-size: 1rem;
}

.lumen-switch__track {
  position: relative;
  flex-shrink: 0;
  width: var(--sw-w);
  height: var(--sw-h);
  border-radius: var(--lumen-radius-full);
  background-color: var(--lumen-border-strong);
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease;
}
.lumen-switch--on .lumen-switch__track {
  background-color: var(--lumen-primary);
}
.lumen-switch:focus-visible {
  outline: none;
}
.lumen-switch:focus-visible .lumen-switch__track {
  box-shadow: var(--lumen-focus-ring);
}

.lumen-switch__thumb {
  position: absolute;
  top: 50%;
  left: calc((var(--sw-h) - var(--sw-thumb)) / 2);
  width: var(--sw-thumb);
  height: var(--sw-thumb);
  border-radius: var(--lumen-radius-full);
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.3);
  transform: translate(0, -50%);
  transition: transform 0.15s ease;
}
.lumen-switch--on .lumen-switch__thumb {
  transform: translate(calc(var(--sw-w) - var(--sw-h)), -50%);
}

.lumen-switch__spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--sw-thumb) * 0.7);
  height: calc(var(--sw-thumb) * 0.7);
  border: 2px solid rgb(255 255 255 / 0.5);
  border-top-color: #ffffff;
  border-radius: var(--lumen-radius-full);
  transform: translate(-50%, -50%);
  animation: lumen-spin 0.7s linear infinite;
}

.lumen-switch__label {
  line-height: 1.4;
}

.lumen-switch--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
