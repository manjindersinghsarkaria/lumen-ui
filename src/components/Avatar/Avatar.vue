<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { AvatarGroupContext } from './AvatarGroup.vue'

/**
 * Avatar — user picture with initials fallback, sizes, shapes, and
 * an optional status dot. When nested in AvatarGroup, inherits the
 * group's size/shape unless overridden.
 */

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AvatarShape = 'circle' | 'square'
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away'

export interface AvatarProps {
  /** Image URL. Falls back to initials/icon on error. */
  src?: string
  /** Image alt text. */
  alt?: string
  /** Full name — used for initials and the default aria-label. */
  name?: string
  /** Explicit initials (overrides the name-derived ones). */
  initials?: string
  /** Named size or a pixel value. */
  size?: AvatarSize | number
  /** Circle or rounded square. */
  shape?: AvatarShape
  /** Presence dot. */
  status?: AvatarStatus
  /** Accessible label (defaults to the name). */
  ariaLabel?: string
}

const props = withDefaults(defineProps<AvatarProps>(), {
  src: undefined,
  alt: undefined,
  name: undefined,
  initials: undefined,
  size: undefined,
  shape: undefined,
  status: undefined,
  ariaLabel: undefined,
})

const group = inject<AvatarGroupContext | null>('lumenAvatarGroup', null)

const resolvedSize = computed(() => props.size ?? group?.size ?? 'md')
const resolvedShape = computed(() => props.shape ?? group?.shape ?? 'circle')

const imageFailed = ref(false)
const showImage = computed(() => !!props.src && !imageFailed.value)

const derivedInitials = computed(() => {
  if (props.initials) return props.initials
  if (!props.name) return ''
  return props.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
})

const sizeStyle = computed(() => {
  if (typeof resolvedSize.value === 'number') {
    return { width: `${resolvedSize.value}px`, height: `${resolvedSize.value}px` }
  }
  return {}
})

const sizeClass = computed(() =>
  typeof resolvedSize.value === 'number' ? '' : `lumen-avatar--${resolvedSize.value}`,
)

function onImageError(): void {
  imageFailed.value = true
}
</script>

<template>
  <span
    class="lumen-avatar"
    :class="[sizeClass, `lumen-avatar--${resolvedShape}`]"
    :style="sizeStyle"
    role="img"
    :aria-label="ariaLabel ?? name ?? undefined"
  >
    <span class="lumen-avatar__body">
      <img
        v-if="showImage"
        class="lumen-avatar__img"
        :src="src"
        :alt="alt ?? name ?? ''"
        @error="onImageError"
      />
      <span v-else class="lumen-avatar__fallback" aria-hidden="true">
        <slot>
          <span v-if="derivedInitials" class="lumen-avatar__initials">{{ derivedInitials }}</span>
          <svg v-else viewBox="0 0 24 24" class="lumen-avatar__icon">
            <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <circle cx="12" cy="8.5" r="3.5" />
              <path d="M5 19.5c1.2-3.2 3.8-5 7-5s5.8 1.8 7 5" />
            </g>
          </svg>
        </slot>
      </span>
    </span>
    <span
      v-if="status"
      class="lumen-avatar__status"
      :class="`lumen-avatar__status--${status}`"
      aria-hidden="true"
    />
  </span>
</template>

<style>
.lumen-avatar {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  vertical-align: middle;
}
.lumen-avatar__body {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: inherit;
  background-color: var(--lumen-bg-subtle);
  color: var(--lumen-text-muted);
  font-family: var(--lumen-font-sans);
  font-weight: 600;
}
.lumen-avatar--circle {
  border-radius: 50%;
}
.lumen-avatar--square {
  border-radius: var(--lumen-radius-md);
}

.lumen-avatar--xs {
  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.5625rem;
}
.lumen-avatar--sm {
  width: 2rem;
  height: 2rem;
  font-size: 0.6875rem;
}
.lumen-avatar--md {
  width: 2.5rem;
  height: 2.5rem;
  font-size: 0.8125rem;
}
.lumen-avatar--lg {
  width: 3.5rem;
  height: 3.5rem;
  font-size: 1.125rem;
}
.lumen-avatar--xl {
  width: 5rem;
  height: 5rem;
  font-size: 1.625rem;
}

.lumen-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lumen-avatar__fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.lumen-avatar__initials {
  line-height: 1;
  letter-spacing: 0.02em;
}

.lumen-avatar__icon {
  width: 55%;
  height: 55%;
}

.lumen-avatar__status {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 0.75rem;
  height: 0.75rem;
  border: 2px solid var(--lumen-surface);
  border-radius: 50%;
  background-color: var(--lumen-text-muted);
}
.lumen-avatar--xs .lumen-avatar__status,
.lumen-avatar--sm .lumen-avatar__status {
  width: 0.5625rem;
  height: 0.5625rem;
  border-width: 1.5px;
}
.lumen-avatar__status--online {
  background-color: var(--lumen-success);
}
.lumen-avatar__status--busy {
  background-color: var(--lumen-danger);
}
.lumen-avatar__status--away {
  background-color: var(--lumen-warning);
}
</style>
