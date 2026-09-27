<script setup lang="ts">
import { watch } from 'vue'
import Radio from './Radio.vue'

/**
 * RadioGroup — single-select from an options list, laid out in a row or column.
 */

export interface RadioGroupOption {
  value: string | number
  label: string
  disabled?: boolean
}

export type RadioGroupDirection = 'row' | 'column'

export interface RadioGroupProps {
  /** Available options. */
  options?: RadioGroupOption[]
  /** Native input name shared by the group's radios. */
  name?: string
  /** Disables every radio. */
  disabled?: boolean
  /** Layout direction. */
  direction?: RadioGroupDirection
}

withDefaults(defineProps<RadioGroupProps>(), {
  options: () => [],
  name: undefined,
  disabled: false,
  direction: 'column',
})

const emit = defineEmits<{
  change: [value: string | number | null]
}>()

const model = defineModel<string | number | null>({ default: null })

watch(model, (value) => {
  emit('change', value)
})
</script>

<template>
  <div
    class="lumen-radio-group"
    :class="`lumen-radio-group--${direction}`"
    role="radiogroup"
  >
    <Radio
      v-for="option in options"
      :key="String(option.value)"
      v-model="model"
      :value="option.value"
      :name="name"
      :disabled="disabled || option.disabled"
    >
      {{ option.label }}
    </Radio>
  </div>
</template>

<style>
.lumen-radio-group {
  display: flex;
  gap: 0.5rem;
}
.lumen-radio-group--column {
  flex-direction: column;
  align-items: flex-start;
}
.lumen-radio-group--row {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
}
</style>
