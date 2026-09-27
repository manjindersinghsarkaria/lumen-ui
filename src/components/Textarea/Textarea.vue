<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from '../../i18n'
import { calcAutosizeHeight } from './autosize'

/**
 * Textarea — multi-line text field with v-model, autosize (min/max rows),
 * maxlength + i18n character counter, and error state.
 */

export type TextareaSize = 'sm' | 'md' | 'lg'

export interface AutosizeConfig {
  minRows?: number
  maxRows?: number
}

export interface TextareaProps {
  /** Size variant. */
  size?: TextareaSize
  /** Placeholder text. */
  placeholder?: string
  /** Disables the field. */
  disabled?: boolean
  /** Read-only field. */
  readonly?: boolean
  /** Error message — puts the field in the error state. */
  error?: string
  /** Maximum character length. */
  maxlength?: number
  /** Visible row count when not autosizing. */
  rows?: number
  /** Grow/shrink with content. `true` or `{ minRows, maxRows }`. */
  autosize?: boolean | AutosizeConfig
  /** Accessible label when no visible label is associated. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<TextareaProps>(), {
  size: 'md',
  placeholder: undefined,
  disabled: false,
  readonly: false,
  error: undefined,
  maxlength: undefined,
  rows: 3,
  autosize: false,
  ariaLabel: undefined,
})

const emit = defineEmits<{
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const model = defineModel<string>({ default: '' })

const { t } = useI18n()

let idCounter = 0
const errorId = `lumen-textarea-error-${++idCounter}`

const ta = ref<HTMLTextAreaElement | null>(null)

const autosizeConfig = computed<AutosizeConfig | null>(() => {
  if (props.autosize === true) return {}
  if (props.autosize) return props.autosize
  return null
})

function resize(): void {
  const el = ta.value
  const cfg = autosizeConfig.value
  if (!el || !cfg) return
  el.style.height = 'auto'
  const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20
  const height = calcAutosizeHeight(el.scrollHeight, lineHeight, cfg.minRows, cfg.maxRows)
  el.style.height = `${height}px`
  el.style.overflowY = cfg.maxRows !== undefined ? 'auto' : 'hidden'
}

function onInput(): void {
  resize()
}

onMounted(() => {
  resize()
})

watch(model, () => {
  void nextTick(resize)
})
watch(autosizeConfig, () => {
  const el = ta.value
  if (el && !autosizeConfig.value) {
    el.style.height = ''
    el.style.overflowY = ''
  }
  void nextTick(resize)
})
</script>

<template>
  <div class="lumen-textarea-wrap">
    <textarea
      ref="ta"
      v-model="model"
      class="lumen-textarea"
      :class="[`lumen-textarea--${size}`, { 'lumen-textarea--error': !!error }]"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :rows="rows"
      :aria-label="ariaLabel"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="error ? errorId : undefined"
      @input="onInput"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />
    <div v-if="error || maxlength !== undefined" class="lumen-textarea__footer">
      <p v-if="error" :id="errorId" class="lumen-textarea__error" role="alert">{{ error }}</p>
      <span v-if="maxlength !== undefined" class="lumen-textarea__count">
        {{ t('textarea.characters', { count: model.length, max: maxlength }) }}
      </span>
    </div>
  </div>
</template>

<style>
.lumen-textarea-wrap {
  width: 100%;
}

.lumen-textarea {
  display: block;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--lumen-surface);
  border: 1px solid var(--lumen-border);
  border-radius: var(--lumen-radius-md);
  color: var(--lumen-text);
  font-family: var(--lumen-font-sans);
  resize: vertical;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}
.lumen-textarea:hover:not(:disabled) {
  border-color: var(--lumen-border-strong);
}
.lumen-textarea:focus {
  outline: none;
  border-color: var(--lumen-primary);
  box-shadow: var(--lumen-focus-ring);
}
.lumen-textarea::placeholder {
  color: var(--lumen-text-muted);
}
.lumen-textarea:disabled {
  background-color: var(--lumen-bg-subtle);
  cursor: not-allowed;
  opacity: 0.7;
}

.lumen-textarea--sm {
  padding: 0.375rem 0.625rem;
  font-size: 0.8125rem;
  line-height: 1.5;
}
.lumen-textarea--md {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
}
.lumen-textarea--lg {
  padding: 0.6875rem 0.875rem;
  font-size: 1rem;
  line-height: 1.5;
}

.lumen-textarea--error {
  border-color: var(--lumen-danger);
}
.lumen-textarea--error:focus {
  border-color: var(--lumen-danger);
  box-shadow: 0 0 0 3px rgb(220 38 38 / 0.18);
}

.lumen-textarea__footer {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.lumen-textarea__error {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--lumen-danger);
}

.lumen-textarea__count {
  margin-left: auto;
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--lumen-text-muted);
  white-space: nowrap;
}
</style>
