<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from '../../i18n'

/**
 * Modal — dialog teleported to <body> with sizes, configurable ESC/backdrop
 * dismissal, a basic focus trap with focus return, and body scroll locking.
 */

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ModalProps {
  /** Dialog title (the header slot takes precedence). */
  title?: string
  /** Accessible label for the dialog (defaults to the title). */
  ariaLabel?: string
  /** Size variant. */
  size?: ModalSize
  /** Shows the X close button. */
  closable?: boolean
  /** Close on Escape. */
  closeOnEscape?: boolean
  /** Close on backdrop click. */
  closeOnBackdrop?: boolean
  /** Lock body scroll while open. */
  lockScroll?: boolean
  /** Accessible label for the close button (i18n-able; defaults to t('modal.close')). */
  closeLabel?: string
}

const props = withDefaults(defineProps<ModalProps>(), {
  title: undefined,
  ariaLabel: undefined,
  size: 'md',
  closable: true,
  closeOnEscape: true,
  closeOnBackdrop: true,
  lockScroll: true,
  closeLabel: undefined,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  open: []
  close: []
}>()

const { t } = useI18n()

const open = defineModel<boolean>('open', { default: false })
const panelRef = ref<HTMLElement | null>(null)

let previouslyFocused: Element | null = null
let previousOverflow = ''

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusable(): HTMLElement[] {
  if (!panelRef.value) return []
  return Array.from(panelRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
}

function close(): void {
  open.value = false
  emit('close')
}

function onBackdropClick(): void {
  if (props.closeOnBackdrop) close()
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.closeOnEscape) {
    close()
    return
  }
  if (event.key !== 'Tab' || !panelRef.value) return
  const focusable = getFocusable()
  if (focusable.length === 0) {
    event.preventDefault()
    return
  }
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function teardown(): void {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = previousOverflow
  if (previouslyFocused instanceof HTMLElement) {
    previouslyFocused.focus()
    previouslyFocused = null
  }
}

watch(
  open,
  async (isOpen) => {
    if (isOpen) {
      previouslyFocused = document.activeElement
      previousOverflow = document.body.style.overflow
      if (props.lockScroll) document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', onKeydown)
      await nextTick()
      const focusable = getFocusable()
      ;(focusable[0] ?? panelRef.value)?.focus()
      emit('open')
    } else {
      teardown()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  if (open.value) document.body.style.overflow = previousOverflow
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="lumen-modal">
      <div class="lumen-modal__backdrop" @click="onBackdropClick" />
      <div class="lumen-modal__wrapper">
        <div
          ref="panelRef"
          class="lumen-modal__panel"
          :class="`lumen-modal__panel--${size}`"
          role="dialog"
          aria-modal="true"
          :aria-label="ariaLabel ?? title"
          tabindex="-1"
        >
          <div v-if="$slots.header || title || closable" class="lumen-modal__header">
            <slot name="header">
              <h3 v-if="title" class="lumen-modal__title">{{ title }}</h3>
            </slot>
            <button
              v-if="closable"
              type="button"
              class="lumen-modal__close"
              :aria-label="closeLabel ?? t('modal.close')"
              @click="close"
            >
              <svg viewBox="0 0 16 16" class="lumen-modal__close-svg" aria-hidden="true">
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
          <div class="lumen-modal__body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="lumen-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
.lumen-modal {
  position: fixed;
  inset: 0;
  z-index: var(--lumen-z-modal);
  font-family: var(--lumen-font-sans);
  color: var(--lumen-text);
}

.lumen-modal__backdrop {
  position: absolute;
  inset: 0;
  background-color: rgb(15 23 42 / 0.5);
}

.lumen-modal__wrapper {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  pointer-events: none;
}

.lumen-modal__panel {
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: calc(100vh - 2rem);
  background-color: var(--lumen-surface);
  border-radius: var(--lumen-radius-lg);
  box-shadow: var(--lumen-shadow-lg);
  outline: none;
}
.lumen-modal__panel--sm {
  max-width: 24rem;
}
.lumen-modal__panel--md {
  max-width: 32rem;
}
.lumen-modal__panel--lg {
  max-width: 48rem;
}
.lumen-modal__panel--xl {
  max-width: 64rem;
}

.lumen-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--lumen-border);
}

.lumen-modal__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
}

.lumen-modal__close {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  border-radius: var(--lumen-radius-sm);
  background: transparent;
  color: var(--lumen-text-muted);
  cursor: pointer;
}
.lumen-modal__close:hover {
  background-color: var(--lumen-surface-strong);
  color: var(--lumen-text);
}
.lumen-modal__close:focus-visible {
  outline: none;
  box-shadow: var(--lumen-focus-ring);
}
.lumen-modal__close-svg {
  width: 1rem;
  height: 1rem;
}

.lumen-modal__body {
  padding: 1.25rem;
  overflow-y: auto;
}

.lumen-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--lumen-border);
}
</style>
