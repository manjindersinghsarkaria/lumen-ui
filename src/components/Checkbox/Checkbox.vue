<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

/**
 * Checkbox — boolean toggle with an indeterminate state and label slot.
 * Wraps a native checkbox so keyboard + screen-reader behavior is built in.
 */

export interface CheckboxProps {
  /** Disables the checkbox. */
  disabled?: boolean
  /** Shows the "partially checked" dash (visual only). */
  indeterminate?: boolean
  /** Label text (the default slot takes precedence). */
  label?: string
}

const props = withDefaults(defineProps<CheckboxProps>(), {
  disabled: false,
  indeterminate: false,
  label: undefined,
})

const model = defineModel<boolean>({ default: false })

const inputRef = ref<HTMLInputElement | null>(null)

function syncIndeterminate(): void {
  if (inputRef.value) {
    inputRef.value.indeterminate = props.indeterminate && !model.value
  }
}

onMounted(syncIndeterminate)
watch([() => props.indeterminate, model], syncIndeterminate)
</script>

<template>
  <label
    class="lumen-checkbox"
    :class="{
      'lumen-checkbox--checked': model,
      'lumen-checkbox--indeterminate': indeterminate && !model,
      'lumen-checkbox--disabled': disabled,
    }"
  >
    <input
      ref="inputRef"
      v-model="model"
      type="checkbox"
      class="lumen-checkbox__input"
      :disabled="disabled"
    />
    <span class="lumen-checkbox__box" aria-hidden="true">
      <svg
        v-if="model"
        class="lumen-checkbox__icon"
        viewBox="0 0 16 16"
      >
        <path
          d="M3.5 8.5l3.5 3.5 5.5-7"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <svg
        v-else-if="indeterminate"
        class="lumen-checkbox__icon"
        viewBox="0 0 16 16"
      >
        <path
          d="M3.5 8h9"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
        />
      </svg>
    </span>
    <span v-if="$slots.default || label" class="lumen-checkbox__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style>
.lumen-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--lumen-font-sans);
  font-size: 0.875rem;
  color: var(--lumen-text);
  cursor: pointer;
  user-select: none;
}

.lumen-checkbox__input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  margin: 0;
}

.lumen-checkbox__box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.125rem;
  height: 1.125rem;
  background-color: var(--lumen-surface);
  border: 1.5px solid var(--lumen-border-strong);
  border-radius: var(--lumen-radius-sm);
  color: var(--lumen-on-primary);
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.lumen-checkbox__input:focus-visible + .lumen-checkbox__box {
  outline: none;
  box-shadow: var(--lumen-focus-ring);
}

.lumen-checkbox--checked .lumen-checkbox__box,
.lumen-checkbox--indeterminate .lumen-checkbox__box {
  background-color: var(--lumen-primary);
  border-color: var(--lumen-primary);
}

.lumen-checkbox__icon {
  width: 0.8rem;
  height: 0.8rem;
}

.lumen-checkbox__label {
  line-height: 1.4;
}

.lumen-checkbox--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
