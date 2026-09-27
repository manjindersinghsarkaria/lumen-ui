<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '../../i18n'

/**
 * Alert — inline status message with variant styling, optional icon,
 * title/description slots, and a closable action with an i18n label.
 */

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

export interface AlertProps {
  /** Status color. */
  variant?: AlertVariant
  /** Title text (the title slot takes precedence). */
  title?: string
  /** Shows a close button. */
  closable?: boolean
  /** Accessible label for the close button (i18n-able; defaults to t('alert.close')). */
  closeLabel?: string
  /** Shows the variant icon. */
  showIcon?: boolean
  /** ARIA role. */
  role?: 'alert' | 'status'
}

const props = withDefaults(defineProps<AlertProps>(), {
  variant: 'info',
  title: undefined,
  closable: false,
  closeLabel: undefined,
  showIcon: true,
  role: 'alert',
})

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

const visible = ref(true)

function close(): void {
  visible.value = false
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="lumen-alert" :class="`lumen-alert--${variant}`" :role="role">
    <span v-if="showIcon" class="lumen-alert__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" class="lumen-alert__icon-svg">
        <g
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <template v-if="variant === 'info'">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="11" x2="12" y2="16" />
            <circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none" />
          </template>
          <template v-else-if="variant === 'success'">
            <circle cx="12" cy="12" r="9" />
            <path d="M8.5 12.5l2.5 2.5 4.5-5.5" />
          </template>
          <template v-else-if="variant === 'warning'">
            <path d="M12 3.5L2.8 19.5h18.4L12 3.5z" />
            <line x1="12" y1="9.5" x2="12" y2="13.5" />
            <circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none" />
          </template>
          <template v-else>
            <circle cx="12" cy="12" r="9" />
            <path d="M9 9l6 6M15 9l-6 6" />
          </template>
        </g>
      </svg>
    </span>
    <div class="lumen-alert__content">
      <div v-if="$slots.title || title" class="lumen-alert__title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div class="lumen-alert__body">
        <slot />
      </div>
      <div v-if="$slots.description" class="lumen-alert__description">
        <slot name="description" />
      </div>
    </div>
    <button
      v-if="closable"
      type="button"
      class="lumen-alert__close"
      :aria-label="closeLabel ?? t('alert.close')"
      @click="close"
    >
      <svg viewBox="0 0 16 16" class="lumen-alert__close-svg" aria-hidden="true">
        <path
          d="M4 4l8 8M12 4l-8 8"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </div>
</template>

<style>
.lumen-alert {
  --lumen-alert-color: var(--lumen-info);
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: 1px solid color-mix(in srgb, var(--lumen-alert-color) 35%, transparent);
  border-radius: var(--lumen-radius-md);
  background-color: color-mix(in srgb, var(--lumen-alert-color) 10%, transparent);
  color: var(--lumen-text);
  font-family: var(--lumen-font-sans);
  font-size: 0.875rem;
  line-height: 1.5;
}
.lumen-alert--success {
  --lumen-alert-color: var(--lumen-success);
}
.lumen-alert--warning {
  --lumen-alert-color: var(--lumen-warning);
}
.lumen-alert--danger {
  --lumen-alert-color: var(--lumen-danger);
}

.lumen-alert__icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
  color: var(--lumen-alert-color);
}
.lumen-alert__icon-svg {
  display: block;
  width: 1.125rem;
  height: 1.125rem;
}

.lumen-alert__content {
  flex: 1;
  min-width: 0;
}

.lumen-alert__title {
  font-weight: 600;
}

.lumen-alert__title + .lumen-alert__body,
.lumen-alert__body + .lumen-alert__description {
  margin-top: 0.25rem;
}

.lumen-alert__description {
  color: var(--lumen-text-muted);
  font-size: 0.8125rem;
}

.lumen-alert__close {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: none;
  border-radius: var(--lumen-radius-sm);
  background: transparent;
  color: var(--lumen-text-muted);
  cursor: pointer;
}
.lumen-alert__close:hover {
  background-color: color-mix(in srgb, var(--lumen-alert-color) 12%, transparent);
  color: var(--lumen-text);
}
.lumen-alert__close:focus-visible {
  outline: none;
  box-shadow: var(--lumen-focus-ring);
}
.lumen-alert__close-svg {
  width: 0.875rem;
  height: 0.875rem;
}
</style>
