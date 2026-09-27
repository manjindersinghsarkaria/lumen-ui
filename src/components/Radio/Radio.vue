<script setup lang="ts">
/**
 * Radio — single-select option with a label slot.
 * Wraps a native radio so keyboard + screen-reader behavior is built in.
 */

export interface RadioProps {
  /** The value this radio represents. */
  value: string | number | boolean
  /** Disables the radio. */
  disabled?: boolean
  /** Label text (the default slot takes precedence). */
  label?: string
  /** Native input name (groups radios natively). */
  name?: string
}

const props = withDefaults(defineProps<RadioProps>(), {
  disabled: false,
  label: undefined,
  name: undefined,
})

const model = defineModel<string | number | boolean | null>({ default: null })
</script>

<template>
  <label
    class="lumen-radio"
    :class="{
      'lumen-radio--checked': model === value,
      'lumen-radio--disabled': disabled,
    }"
  >
    <input
      v-model="model"
      type="radio"
      class="lumen-radio__input"
      :value="value"
      :name="name"
      :disabled="disabled"
    />
    <span class="lumen-radio__circle" aria-hidden="true">
      <span class="lumen-radio__dot" />
    </span>
    <span v-if="$slots.default || label" class="lumen-radio__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style>
.lumen-radio {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--lumen-font-sans);
  font-size: 0.875rem;
  color: var(--lumen-text);
  cursor: pointer;
  user-select: none;
}

.lumen-radio__input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  margin: 0;
}

.lumen-radio__circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.125rem;
  height: 1.125rem;
  background-color: var(--lumen-surface);
  border: 1.5px solid var(--lumen-border-strong);
  border-radius: var(--lumen-radius-full);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.lumen-radio__input:focus-visible + .lumen-radio__circle {
  outline: none;
  box-shadow: var(--lumen-focus-ring);
}

.lumen-radio__dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: var(--lumen-radius-full);
  background-color: var(--lumen-primary);
  transform: scale(0);
  transition: transform 0.15s ease;
}

.lumen-radio--checked .lumen-radio__circle {
  border-color: var(--lumen-primary);
}
.lumen-radio--checked .lumen-radio__dot {
  transform: scale(1);
}

.lumen-radio__label {
  line-height: 1.4;
}

.lumen-radio--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
