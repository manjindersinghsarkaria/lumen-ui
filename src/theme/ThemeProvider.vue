<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { applyTheme, type ThemeColors, type ThemeMode } from './theme'

/**
 * ThemeProvider — scopes a theme to its subtree.
 * Applies the palette CSS vars and `data-theme` to its root element.
 */

const props = withDefaults(
  defineProps<{
    /** Partial palette — any org brand colors; unspecified keys use the defaults. */
    colors?: ThemeColors
    /** Color-scheme mode for this subtree (defaults to the global mode). */
    mode?: ThemeMode
    /** Wrapper element tag. */
    tag?: string
  }>(),
  { tag: 'div' },
)

const root = ref<HTMLElement | null>(null)

function apply(): void {
  if (root.value) {
    applyTheme(root.value, props.colors, props.mode)
  }
}

onMounted(apply)
watch(
  () => [props.colors, props.mode],
  apply,
  { deep: true },
)
</script>

<template>
  <component :is="tag" ref="root" class="lumen-theme-provider">
    <slot />
  </component>
</template>
