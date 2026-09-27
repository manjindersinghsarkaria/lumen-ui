<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from '../../i18n'

/**
 * Pagination — page navigation with optional page-size select and jumper.
 */

export interface PaginationProps {
  /** Current page (v-model). */
  page?: number
  /** Items per page (v-model:pageSize). */
  pageSize?: number
  /** Total item count. */
  total?: number
  /** Page-size options. */
  pageSizes?: number[]
  /** Show the page-size select. */
  showSizeChanger?: boolean
  /** Show the jump-to-page input. */
  showJumper?: boolean
  /** Disable all controls. */
  disabled?: boolean
  /** Accessible label for the nav landmark. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<PaginationProps>(), {
  page: 1,
  pageSize: 10,
  total: 0,
  pageSizes: () => [10, 20, 50, 100],
  showSizeChanger: true,
  showJumper: false,
  disabled: false,
  ariaLabel: undefined,
})

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
  change: [page: number, pageSize: number]
}>()

const { t } = useI18n()

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.total / Math.max(1, props.pageSize))),
)
const current = computed(() => Math.min(Math.max(1, props.page), totalPages.value))

type PageItem = number | 'ellipsis-prev' | 'ellipsis-next'

const items = computed<PageItem[]>(() => {
  const total = totalPages.value
  const cur = current.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const nums = [...new Set([1, total, cur - 1, cur, cur + 1])]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b)
  const out: PageItem[] = []
  let prev = 0
  for (const n of nums) {
    if (prev && n - prev > 1) out.push(n < cur ? 'ellipsis-prev' : 'ellipsis-next')
    out.push(n)
    prev = n
  }
  return out
})

const jumpInput = ref('')

function goTo(page: number) {
  const target = Math.min(Math.max(1, page), totalPages.value)
  if (target === current.value) return
  emit('update:page', target)
  emit('change', target, props.pageSize)
}

function onSizeChange(event: Event) {
  const size = Number((event.target as HTMLSelectElement).value)
  if (!Number.isFinite(size) || size <= 0) return
  emit('update:pageSize', size)
  emit('update:page', 1)
  emit('change', 1, size)
}

function onJump() {
  const target = parseInt(jumpInput.value, 10)
  jumpInput.value = ''
  if (!Number.isFinite(target)) return
  goTo(target)
}
</script>

<template>
  <nav class="lumen-pagination" :aria-label="ariaLabel ?? t('pagination.label')">
    <button
      type="button"
      class="lumen-pagination__btn"
      :disabled="disabled || current <= 1"
      :aria-label="t('pagination.prev')"
      @click="goTo(current - 1)"
    >
      ‹
    </button>
    <template v-for="(item, i) in items" :key="`${item}-${i}`">
      <button
        v-if="typeof item === 'number'"
        type="button"
        class="lumen-pagination__btn"
        :class="{ 'lumen-pagination__btn--active': item === current }"
        :disabled="disabled"
        :aria-label="t('pagination.goToPage', { page: item })"
        :aria-current="item === current ? 'page' : undefined"
        @click="goTo(item)"
      >
        {{ item }}
      </button>
      <span v-else class="lumen-pagination__ellipsis" aria-hidden="true">…</span>
    </template>
    <button
      type="button"
      class="lumen-pagination__btn"
      :disabled="disabled || current >= totalPages"
      :aria-label="t('pagination.next')"
      @click="goTo(current + 1)"
    >
      ›
    </button>
    <label v-if="showSizeChanger" class="lumen-pagination__sizes">
      <select
        :value="pageSize"
        :disabled="disabled"
        :aria-label="t('pagination.pageSize')"
        @change="onSizeChange"
      >
        <option v-for="s in pageSizes" :key="s" :value="s">{{ s }}</option>
      </select>
    </label>
    <form v-if="showJumper" class="lumen-pagination__jumper" @submit.prevent="onJump">
      <label>
        {{ t('pagination.jumpTo') }}
        <input
          v-model="jumpInput"
          type="number"
          min="1"
          :max="totalPages"
          :disabled="disabled"
        />
      </label>
    </form>
  </nav>
</template>

<style>
.lumen-pagination {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-family: var(--lumen-font-sans);
}

.lumen-pagination__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.375rem;
  font-size: 0.875rem;
  color: var(--lumen-text);
  background-color: transparent;
  border: 1px solid var(--lumen-border);
  border-radius: var(--lumen-radius-sm);
  cursor: pointer;
}

.lumen-pagination__btn:hover:not(:disabled) {
  background-color: var(--lumen-bg-subtle);
}

.lumen-pagination__btn--active {
  color: var(--lumen-on-primary);
  background-color: var(--lumen-primary);
  border-color: var(--lumen-primary);
}

.lumen-pagination__btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.lumen-pagination__ellipsis {
  padding: 0 0.25rem;
  color: var(--lumen-text-muted);
  user-select: none;
}

.lumen-pagination__sizes select,
.lumen-pagination__jumper input {
  height: 2rem;
  padding: 0 0.5rem;
  font-size: 0.875rem;
  color: var(--lumen-text);
  background-color: var(--lumen-bg);
  border: 1px solid var(--lumen-border);
  border-radius: var(--lumen-radius-sm);
}

.lumen-pagination__sizes {
  margin-left: 0.5rem;
}

.lumen-pagination__jumper {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  color: var(--lumen-text-muted);
}

.lumen-pagination__jumper input {
  width: 3.5rem;
  margin-left: 0.25rem;
}
</style>
