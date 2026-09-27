<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../i18n'

/**
 * Breadcrumb — navigation trail with links, custom separators,
 * and collapsing of long trails.
 */

export interface BreadcrumbItem {
  /** Visible text. */
  label: string
  /** Link target; without it the item renders as plain text. */
  href?: string
  /** Optional icon text; rendered via the item-icon slot when provided. */
  icon?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  /** Separator between items (the separator slot takes precedence). */
  separator?: string
  /** Max visible items before the middle collapses into an ellipsis. */
  maxItems?: number
  /** Accessible label for the nav landmark. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  separator: '/',
  maxItems: undefined,
  ariaLabel: undefined,
})

const { t } = useI18n()

type VisibleItem = { kind: 'item'; item: BreadcrumbItem; index: number } | { kind: 'ellipsis' }

const visible = computed<VisibleItem[]>(() => {
  const all = props.items.map((item, index) => ({ kind: 'item' as const, item, index }))
  const max = props.maxItems
  if (max === undefined || max < 3 || props.items.length <= max) return all
  // Keep the first item, collapse the middle, keep the last (max - 1) items.
  return [all[0], { kind: 'ellipsis' }, ...all.slice(-(max - 1))]
})

function isLast(visibleIndex: number): boolean {
  return visibleIndex === visible.value.length - 1
}
</script>

<template>
  <nav class="lumen-breadcrumb" :aria-label="ariaLabel ?? t('breadcrumb.label')">
    <ol class="lumen-breadcrumb__list">
      <li
        v-for="(entry, vi) in visible"
        :key="entry.kind === 'item' ? `item-${entry.index}` : 'ellipsis'"
        class="lumen-breadcrumb__entry"
      >
        <template v-if="entry.kind === 'ellipsis'">
          <span class="lumen-breadcrumb__ellipsis" aria-hidden="true">…</span>
        </template>
        <template v-else>
          <span v-if="entry.item.icon || $slots['item-icon']" class="lumen-breadcrumb__icon">
            <slot name="item-icon" :item="entry.item" :index="entry.index">
              {{ entry.item.icon }}
            </slot>
          </span>
          <a
            v-if="entry.item.href && !isLast(vi)"
            class="lumen-breadcrumb__link"
            :href="entry.item.href"
          >
            {{ entry.item.label }}
          </a>
          <span v-else class="lumen-breadcrumb__current" :aria-current="isLast(vi) ? 'page' : undefined">
            {{ entry.item.label }}
          </span>
        </template>
        <span
          v-if="vi < visible.length - 1"
          class="lumen-breadcrumb__separator"
          aria-hidden="true"
        >
          <slot name="separator">{{ separator }}</slot>
        </span>
      </li>
    </ol>
  </nav>
</template>

<style>
.lumen-breadcrumb {
  font-family: var(--lumen-font-sans);
  font-size: 0.875rem;
}

.lumen-breadcrumb__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

.lumen-breadcrumb__entry {
  display: inline-flex;
  align-items: center;
}

.lumen-breadcrumb__icon {
  display: inline-flex;
  margin-right: 0.375rem;
  color: var(--lumen-text-muted);
}

.lumen-breadcrumb__link {
  color: var(--lumen-text-muted);
  text-decoration: none;
}
.lumen-breadcrumb__link:hover {
  color: var(--lumen-primary);
  text-decoration: underline;
}

.lumen-breadcrumb__current {
  color: var(--lumen-text);
  font-weight: 500;
}

.lumen-breadcrumb__separator {
  margin: 0 0.5rem;
  color: var(--lumen-text-muted);
  user-select: none;
}

.lumen-breadcrumb__ellipsis {
  padding: 0 0.25rem;
  color: var(--lumen-text-muted);
  user-select: none;
}
</style>
