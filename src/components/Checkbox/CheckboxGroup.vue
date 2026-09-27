<script setup lang="ts">
import { computed } from 'vue'
import Checkbox from './Checkbox.vue'

/**
 * CheckboxGroup — multi-select from an options list with min/max limits.
 */

export interface CheckboxGroupOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface CheckboxGroupProps {
  /** Available options. */
  options?: CheckboxGroupOption[]
  /** Minimum number of checked options. */
  min?: number
  /** Maximum number of checked options. */
  max?: number
  /** Disables every checkbox. */
  disabled?: boolean
}

const props = withDefaults(defineProps<CheckboxGroupProps>(), {
  options: () => [],
  min: undefined,
  max: undefined,
  disabled: false,
})

const emit = defineEmits<{
  change: [value: Array<string | number>]
}>()

const model = defineModel<Array<string | number>>({ default: () => [] })

const atMax = computed(
  () => props.max !== undefined && model.value.length >= props.max,
)

function isChecked(value: string | number): boolean {
  return model.value.includes(value)
}

function isOptionDisabled(option: CheckboxGroupOption): boolean {
  return props.disabled || !!option.disabled || (atMax.value && !isChecked(option.value))
}

function toggle(value: string | number, optionDisabled: boolean | undefined): void {
  if (props.disabled || optionDisabled) return
  const next = [...model.value]
  const i = next.indexOf(value)
  if (i >= 0) {
    if (props.min !== undefined && next.length <= props.min) return
    next.splice(i, 1)
  } else {
    if (props.max !== undefined && next.length >= props.max) return
    next.push(value)
  }
  model.value = next
  emit('change', next)
}
</script>

<template>
  <div class="lumen-checkbox-group" role="group">
    <Checkbox
      v-for="option in options"
      :key="String(option.value)"
      :model-value="isChecked(option.value)"
      :disabled="isOptionDisabled(option)"
      @update:model-value="toggle(option.value, option.disabled)"
    >
      {{ option.label }}
    </Checkbox>
  </div>
</template>

<style>
.lumen-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
