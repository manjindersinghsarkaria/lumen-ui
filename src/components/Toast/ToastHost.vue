<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../i18n'
import { useToast } from './toast'
import type { ToastItem, ToastPlacement } from './toast'

/**
 * ToastHost — renders toasts fired via `useToast()`. Mount once per app;
 * toasts teleport to <body> so they escape any stacking context.
 */

export interface ToastHostProps {
  /** Default placement; individual toasts can override it. */
  placement?: ToastPlacement
}

const props = withDefaults(defineProps<ToastHostProps>(), {
  placement: 'top-right',
})

const { t } = useI18n()
const { toasts, close } = useToast()

const groups = computed(() => {
  const map = new Map<ToastPlacement, ToastItem[]>()
  for (const toast of toasts.value) {
    const key = toast.placement ?? props.placement
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(toast)
  }
  return [...map.entries()]
})
</script>

<template>
  <Teleport to="body">
    <div
      v-for="[placement, group] in groups"
      :key="placement"
      class="lumen-toast__container"
      :class="`lumen-toast__container--${placement}`"
      :aria-label="t('toast.label')"
    >
      <TransitionGroup name="lumen-toast" tag="div" class="lumen-toast__list">
        <div
          v-for="toast in group"
          :key="toast.id"
          class="lumen-toast"
          :class="`lumen-toast--${toast.type}`"
          role="status"
        >
          <span class="lumen-toast__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <g
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <template v-if="toast.type === 'success'">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8.5 12.5l2.5 2.5 5-6" />
                </template>
                <template v-else-if="toast.type === 'error'">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9 9l6 6M15 9l-6 6" />
                </template>
                <template v-else-if="toast.type === 'warning'">
                  <path d="M12 4L2.5 20h19L12 4z" />
                  <path d="M12 10v4M12 17.5v.5" />
                </template>
                <template v-else>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 11v5M12 7.5v.5" />
                </template>
              </g>
            </svg>
          </span>
          <div class="lumen-toast__body">
            <div class="lumen-toast__message">{{ toast.message }}</div>
            <div v-if="toast.description" class="lumen-toast__description">
              {{ toast.description }}
            </div>
          </div>
          <button
            v-if="toast.closable"
            type="button"
            class="lumen-toast__close"
            :aria-label="t('toast.close')"
            @click="close(toast.id)"
          >
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style>
.lumen-toast__container {
  position: fixed;
  z-index: var(--lumen-z-toast);
  display: flex;
  pointer-events: none;
}

.lumen-toast__container--top-right {
  top: 1rem;
  right: 1rem;
}
.lumen-toast__container--top-left {
  top: 1rem;
  left: 1rem;
}
.lumen-toast__container--bottom-right {
  bottom: 1rem;
  right: 1rem;
}
.lumen-toast__container--bottom-left {
  bottom: 1rem;
  left: 1rem;
}
.lumen-toast__container--top-center {
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
}
.lumen-toast__container--bottom-center {
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

.lumen-toast__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lumen-toast {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  min-width: 18rem;
  max-width: 24rem;
  padding: 0.75rem 0.875rem;
  font-family: var(--lumen-font-sans);
  background-color: var(--lumen-bg);
  border: 1px solid var(--lumen-border);
  border-left: 3px solid var(--lumen-info);
  border-radius: var(--lumen-radius-md);
  box-shadow: var(--lumen-shadow-lg);
  pointer-events: auto;
}

.lumen-toast--success {
  border-left-color: var(--lumen-success);
}
.lumen-toast--success .lumen-toast__icon {
  color: var(--lumen-success);
}
.lumen-toast--error {
  border-left-color: var(--lumen-danger);
}
.lumen-toast--error .lumen-toast__icon {
  color: var(--lumen-danger);
}
.lumen-toast--warning {
  border-left-color: var(--lumen-warning);
}
.lumen-toast--warning .lumen-toast__icon {
  color: var(--lumen-warning);
}
.lumen-toast--info .lumen-toast__icon {
  color: var(--lumen-info);
}

.lumen-toast__icon {
  flex: none;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.125rem;
}
.lumen-toast__icon svg {
  width: 100%;
  height: 100%;
}

.lumen-toast__body {
  flex: 1;
  min-width: 0;
}

.lumen-toast__message {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--lumen-text);
}

.lumen-toast__description {
  margin-top: 0.125rem;
  font-size: 0.8125rem;
  color: var(--lumen-text-muted);
}

.lumen-toast__close {
  flex: none;
  padding: 0 0.25rem;
  font-size: 1.125rem;
  line-height: 1;
  color: var(--lumen-text-muted);
  background: none;
  border: none;
  border-radius: var(--lumen-radius-sm);
  cursor: pointer;
}
.lumen-toast__close:hover {
  color: var(--lumen-text);
  background-color: var(--lumen-bg-subtle);
}

.lumen-toast-enter-from,
.lumen-toast-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
.lumen-toast-enter-active,
.lumen-toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
</style>
