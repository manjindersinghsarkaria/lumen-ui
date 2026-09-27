<script setup lang="ts">
/**
 * Card — content container with optional title/subtitle, header/body/footer
 * slots, and bordered/shadow/hoverable variants.
 */

export interface CardProps {
  /** Card title (overridden by the header slot). */
  title?: string
  /** Card subtitle (overridden by the header slot). */
  subtitle?: string
  /** Shows a 1px border. */
  bordered?: boolean
  /** Shows a shadow. */
  shadow?: boolean
  /** Lifts with a shadow on hover. */
  hoverable?: boolean
}

withDefaults(defineProps<CardProps>(), {
  title: undefined,
  subtitle: undefined,
  bordered: true,
  shadow: false,
  hoverable: false,
})
</script>

<template>
  <div
    class="lumen-card"
    :class="{
      'lumen-card--bordered': bordered,
      'lumen-card--shadow': shadow,
      'lumen-card--hoverable': hoverable,
    }"
  >
    <div v-if="$slots.header || title || subtitle" class="lumen-card__header">
      <slot name="header">
        <div v-if="title" class="lumen-card__title">{{ title }}</div>
        <div v-if="subtitle" class="lumen-card__subtitle">{{ subtitle }}</div>
      </slot>
    </div>
    <div class="lumen-card__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="lumen-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style>
.lumen-card {
  background-color: var(--lumen-surface);
  border-radius: var(--lumen-radius-lg);
  color: var(--lumen-text);
  font-family: var(--lumen-font-sans);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.lumen-card--bordered {
  border: 1px solid var(--lumen-border);
}

.lumen-card--shadow {
  box-shadow: var(--lumen-shadow-md);
}

.lumen-card--hoverable:hover {
  box-shadow: var(--lumen-shadow-lg);
  transform: translateY(-2px);
}

.lumen-card__header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--lumen-border);
}

.lumen-card__title {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
}

.lumen-card__subtitle {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--lumen-text-muted);
  line-height: 1.4;
}

.lumen-card__body {
  padding: 1.25rem;
}

.lumen-card__footer {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--lumen-border);
}
</style>
