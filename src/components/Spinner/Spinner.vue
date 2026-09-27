<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../i18n'

/**
 * Spinner — animated loading ring, inline or as a fullscreen overlay.
 */

export type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps {
  /** Named size or explicit pixel diameter. */
  size?: SpinnerSize | number
  /** Renders a fixed fullscreen overlay with backdrop (teleported to body). */
  fullscreen?: boolean
  /** Optional text shown next to / under the ring (pass translated text). */
  tip?: string
  /** Accessible label for the status role. Defaults to the i18n "Loading" string. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<SpinnerProps>(), {
  size: 'md',
  fullscreen: false,
  tip: undefined,
  ariaLabel: undefined,
})

const { t } = useI18n()

const SIZE_PX: Record<SpinnerSize, number> = { sm: 16, md: 24, lg: 32 }

const diameter = computed(() =>
  typeof props.size === 'number' ? props.size : SIZE_PX[props.size],
)

const ringStyle = computed(() => ({
  width: `${diameter.value}px`,
  height: `${diameter.value}px`,
  borderWidth: `${Math.max(2, Math.round(diameter.value / 8))}px`,
}))

const label = computed(() => props.ariaLabel ?? t('common.loading'))
</script>

<template>
  <Teleport v-if="fullscreen" to="body">
    <div class="lumen-spinner__overlay" role="status" :aria-label="label">
      <div class="lumen-spinner__box">
        <span class="lumen-spinner__ring" :style="ringStyle" aria-hidden="true" />
        <span v-if="tip" class="lumen-spinner__tip">{{ tip }}</span>
      </div>
    </div>
  </Teleport>
  <span v-else class="lumen-spinner" role="status" :aria-label="label">
    <span class="lumen-spinner__ring" :style="ringStyle" aria-hidden="true" />
    <span v-if="tip" class="lumen-spinner__tip">{{ tip }}</span>
  </span>
</template>

<style>
.lumen-spinner {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--lumen-font-sans);
}

.lumen-spinner__ring {
  display: inline-block;
  border-style: solid;
  border-color: var(--lumen-primary);
  border-top-color: transparent;
  border-radius: var(--lumen-radius-full);
  animation: lumen-spin 0.7s linear infinite;
}

.lumen-spinner__tip {
  font-size: 0.875rem;
  color: var(--lumen-text-muted);
}

.lumen-spinner__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--lumen-z-spinner);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(17 24 39 / 0.45);
}

.lumen-spinner__box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 2rem;
  background-color: var(--lumen-bg);
  border-radius: var(--lumen-radius-lg);
  box-shadow: var(--lumen-shadow-lg);
}

.lumen-spinner__box .lumen-spinner__ring {
  border-color: var(--lumen-primary);
  border-top-color: transparent;
}
</style>
