<script setup lang="ts">
import { computed } from 'vue'

/**
 * Progress — bar or circular progress indicator with status colors.
 */

export type ProgressType = 'bar' | 'circle'
export type ProgressStatus = 'active' | 'success' | 'exception'

export interface ProgressProps {
  /** Completion percentage; clamped to 0–100. */
  percent?: number
  /** Bar or circle rendering. */
  type?: ProgressType
  /** Status color: active (primary), success, or exception. */
  status?: ProgressStatus
  /** Show the info text (percentage) next to / inside the indicator. */
  showInfo?: boolean
  /** Bar height (px) or circle stroke width (px). Defaults: 8 (bar), 6 (circle). */
  strokeWidth?: number
  /** Override the fill color (any CSS color). */
  color?: string
  /** Circle diameter in px (circle type only). */
  size?: number
  /** Custom info text formatter. */
  format?: (percent: number) => string
  /** Accessible label for the progressbar role. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<ProgressProps>(), {
  percent: 0,
  type: 'bar',
  status: 'active',
  showInfo: true,
  strokeWidth: undefined,
  color: undefined,
  size: 120,
  format: undefined,
  ariaLabel: undefined,
})

const clamped = computed(() => {
  const p = Number(props.percent)
  if (!Number.isFinite(p)) return 0
  return Math.min(100, Math.max(0, p))
})

const stroke = computed(() => props.strokeWidth ?? (props.type === 'circle' ? 6 : 8))

const infoText = computed(() =>
  props.format ? props.format(clamped.value) : `${Math.round(clamped.value)}%`,
)

/* Circle geometry, in px units (viewBox matches `size`). */
const radius = computed(() => Math.max(0, (props.size - stroke.value) / 2))
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => circumference.value * (1 - clamped.value / 100))
</script>

<template>
  <div
    class="lumen-progress"
    :class="[`lumen-progress--${type}`, `lumen-progress--${status}`]"
    role="progressbar"
    :aria-valuenow="Math.round(clamped)"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="ariaLabel"
  >
    <template v-if="type === 'bar'">
      <div class="lumen-progress__track" :style="{ height: `${stroke}px` }">
        <div
          class="lumen-progress__fill"
          :style="{ width: `${clamped}%`, backgroundColor: color }"
        />
      </div>
      <span v-if="showInfo" class="lumen-progress__info">{{ infoText }}</span>
    </template>
    <template v-else>
      <div
        class="lumen-progress__circle-wrap"
        :style="{ width: `${size}px`, height: `${size}px` }"
      >
        <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" aria-hidden="true">
          <circle
            class="lumen-progress__circle-track"
            :cx="size / 2"
            :cy="size / 2"
            :r="radius"
            :stroke-width="stroke"
            fill="none"
          />
          <circle
            class="lumen-progress__circle-fill"
            :cx="size / 2"
            :cy="size / 2"
            :r="radius"
            :stroke-width="stroke"
            fill="none"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            :style="{ stroke: color }"
            :transform="`rotate(-90 ${size / 2} ${size / 2})`"
          />
        </svg>
        <span v-if="showInfo" class="lumen-progress__circle-info">{{ infoText }}</span>
      </div>
    </template>
  </div>
</template>

<style>
.lumen-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  font-family: var(--lumen-font-sans);
}

.lumen-progress--circle {
  display: inline-flex;
  width: auto;
}

.lumen-progress__track {
  position: relative;
  flex: 1;
  min-width: 4rem;
  overflow: hidden;
  background-color: var(--lumen-bg-subtle);
  border-radius: var(--lumen-radius-full);
}

.lumen-progress__fill {
  height: 100%;
  border-radius: inherit;
  transition: width 0.3s ease;
}

.lumen-progress--active .lumen-progress__fill {
  background-color: var(--lumen-primary);
}
.lumen-progress--success .lumen-progress__fill {
  background-color: var(--lumen-success);
}
.lumen-progress--exception .lumen-progress__fill {
  background-color: var(--lumen-danger);
}

.lumen-progress__info {
  font-size: 0.875rem;
  line-height: 1;
  white-space: nowrap;
  color: var(--lumen-text);
}

.lumen-progress__circle-wrap {
  position: relative;
  display: inline-flex;
}

.lumen-progress__circle-track {
  stroke: var(--lumen-bg-subtle);
}

.lumen-progress__circle-fill {
  transition: stroke-dashoffset 0.3s ease;
}

.lumen-progress--active .lumen-progress__circle-fill {
  stroke: var(--lumen-primary);
}
.lumen-progress--success .lumen-progress__circle-fill {
  stroke: var(--lumen-success);
}
.lumen-progress--exception .lumen-progress__circle-fill {
  stroke: var(--lumen-danger);
}

.lumen-progress__circle-info {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--lumen-text);
}
</style>
