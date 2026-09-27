<script setup lang="ts">
import { computed, onMounted, onUpdated, ref } from 'vue'
import { useI18n } from '../../i18n'
import { Spinner } from '../Spinner'

/**
 * Table — data table with client-side sorting, row selection,
 * loading and empty states.
 */

export interface TableColumn {
  /** Key into each row object. */
  key: string
  /** Header label (defaults to the key). */
  title?: string
  /** Whether clicking the header sorts by this column. */
  sortable?: boolean
  /** Cell text alignment. */
  align?: 'left' | 'center' | 'right'
  /** Column width (CSS value or px number). */
  width?: string | number
}

export type TableRow = Record<string, unknown>

export interface TableProps {
  columns: TableColumn[]
  rows: TableRow[]
  /** Row identity: a row key, or a function of (row, index). Defaults to the index. */
  rowKey?: string | ((row: TableRow, index: number) => string | number)
  /** Show the selection checkbox column. */
  selectable?: boolean
  /** Selected row keys (v-model:selected). */
  selected?: (string | number)[]
  /** Show the loading state instead of rows. */
  loading?: boolean
  /** Zebra striping. */
  striped?: boolean
  /** Outer + cell borders. */
  bordered?: boolean
  /** Accessible label for the table. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<TableProps>(), {
  rowKey: undefined,
  selectable: false,
  selected: () => [],
  loading: false,
  striped: false,
  bordered: false,
  ariaLabel: undefined,
})

const emit = defineEmits<{
  'update:selected': [selected: (string | number)[]]
  'selection-change': [selected: (string | number)[], rows: TableRow[]]
  'sort-change': [key: string | null, order: 'asc' | 'desc' | null]
}>()

const { t } = useI18n()

/* ---------- sorting (uncontrolled; emits sort-change) ---------- */

const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc' | null>(null)

function toggleSort(key: string) {
  if (sortKey.value !== key) {
    sortKey.value = key
    sortOrder.value = 'asc'
  } else if (sortOrder.value === 'asc') {
    sortOrder.value = 'desc'
  } else {
    sortKey.value = null
    sortOrder.value = null
  }
  emit('sort-change', sortKey.value, sortOrder.value)
}

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a ?? '').localeCompare(String(b ?? ''))
}

const sortedRows = computed(() => {
  if (!sortKey.value || !sortOrder.value) return props.rows
  const key = sortKey.value
  const dir = sortOrder.value === 'asc' ? 1 : -1
  return [...props.rows].sort((ra, rb) => dir * compareValues(ra[key], rb[key]))
})

function ariaSort(col: TableColumn): 'none' | 'ascending' | 'descending' | undefined {
  if (!col.sortable) return undefined
  if (sortKey.value !== col.key) return 'none'
  return sortOrder.value === 'asc' ? 'ascending' : 'descending'
}

/* ---------- selection ---------- */

function rowKeyOf(row: TableRow, index: number): string | number {
  if (typeof props.rowKey === 'function') return props.rowKey(row, index)
  if (typeof props.rowKey === 'string') {
    const v = row[props.rowKey]
    if (typeof v === 'string' || typeof v === 'number') return v
  }
  return index
}

const selectedSet = computed(() => new Set(props.selected))

function isSelected(row: TableRow, index: number): boolean {
  return selectedSet.value.has(rowKeyOf(row, index))
}

function setSelected(keys: (string | number)[]) {
  emit('update:selected', keys)
  const keySet = new Set(keys)
  emit(
    'selection-change',
    keys,
    props.rows.filter((row, i) => keySet.has(rowKeyOf(row, i))),
  )
}

function toggleRow(row: TableRow, index: number) {
  const key = rowKeyOf(row, index)
  const next = new Set(selectedSet.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  setSelected([...next])
}

const allSelected = computed(
  () => props.rows.length > 0 && props.rows.every((row, i) => isSelected(row, i)),
)
const someSelected = computed(
  () => !allSelected.value && props.rows.some((row, i) => isSelected(row, i)),
)

const selectAllRef = ref<HTMLInputElement | null>(null)
function syncIndeterminate() {
  if (selectAllRef.value) selectAllRef.value.indeterminate = someSelected.value
}
onMounted(syncIndeterminate)
onUpdated(syncIndeterminate)

function toggleAll() {
  if (allSelected.value) setSelected([])
  else setSelected(props.rows.map((row, i) => rowKeyOf(row, i)))
}

/* ---------- misc ---------- */

function cellText(row: TableRow, col: TableColumn): string {
  const v = row[col.key]
  return v === null || v === undefined ? '' : String(v)
}

function colWidth(col: TableColumn): string | undefined {
  if (col.width === undefined) return undefined
  return typeof col.width === 'number' ? `${col.width}px` : col.width
}
</script>

<template>
  <div
    class="lumen-table__wrapper"
    :class="{ 'lumen-table__wrapper--bordered': bordered }"
  >
    <table class="lumen-table" :class="{ 'lumen-table--striped': striped }" :aria-label="ariaLabel">
      <thead>
        <tr>
          <th v-if="selectable" class="lumen-table__cell--selection" scope="col">
            <input
              ref="selectAllRef"
              type="checkbox"
              :checked="allSelected"
              :aria-label="t('table.selectAll')"
              @change="toggleAll"
            />
          </th>
          <th
            v-for="col in columns"
            :key="col.key"
            scope="col"
            :class="{ 'lumen-table__th--sortable': col.sortable }"
            :style="{ width: colWidth(col), textAlign: col.align ?? 'left' }"
            :aria-sort="ariaSort(col)"
            @click="col.sortable ? toggleSort(col.key) : undefined"
          >
            <span class="lumen-table__th-content">
              <slot :name="`header-${col.key}`" :column="col">{{ col.title ?? col.key }}</slot>
              <span
                v-if="col.sortable"
                class="lumen-table__sort-icon"
                :class="{ 'lumen-table__sort-icon--active': sortKey === col.key }"
                aria-hidden="true"
              >
                {{ sortKey === col.key ? (sortOrder === 'asc' ? '▲' : '▼') : '△' }}
              </span>
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading" class="lumen-table__state-row">
          <td :colspan="columns.length + (selectable ? 1 : 0)">
            <span class="lumen-table__loading">
              <Spinner size="sm" />
              {{ t('common.loading') }}
            </span>
          </td>
        </tr>
        <tr v-else-if="sortedRows.length === 0" class="lumen-table__state-row">
          <td :colspan="columns.length + (selectable ? 1 : 0)">
            <slot name="empty">{{ t('common.noData') }}</slot>
          </td>
        </tr>
        <template v-else>
          <tr
            v-for="(row, i) in sortedRows"
            :key="rowKeyOf(row, i)"
            :class="{ 'lumen-table__row--selected': isSelected(row, i) }"
          >
            <td v-if="selectable" class="lumen-table__cell--selection">
              <input
                type="checkbox"
                :checked="isSelected(row, i)"
                :aria-label="t('table.selectRow')"
                @change="toggleRow(row, i)"
              />
            </td>
            <td
              v-for="col in columns"
              :key="col.key"
              :style="{ textAlign: col.align ?? 'left' }"
            >
              <slot :name="`cell-${col.key}`" :row="row" :column="col" :index="i">
                {{ cellText(row, col) }}
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style>
.lumen-table__wrapper {
  width: 100%;
  overflow-x: auto;
  font-family: var(--lumen-font-sans);
  font-size: 0.875rem;
  color: var(--lumen-text);
}

.lumen-table__wrapper--bordered {
  border: 1px solid var(--lumen-border);
  border-radius: var(--lumen-radius-md);
}

.lumen-table {
  width: 100%;
  border-collapse: collapse;
}

.lumen-table th,
.lumen-table td {
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--lumen-border);
}

.lumen-table__wrapper--bordered .lumen-table th,
.lumen-table__wrapper--bordered .lumen-table td {
  border-right: 1px solid var(--lumen-border);
}
.lumen-table__wrapper--bordered .lumen-table th:last-child,
.lumen-table__wrapper--bordered .lumen-table td:last-child {
  border-right: none;
}

.lumen-table thead th {
  font-weight: 600;
  color: var(--lumen-text-muted);
  background-color: var(--lumen-bg-subtle);
  white-space: nowrap;
}

.lumen-table__th--sortable {
  cursor: pointer;
  user-select: none;
}
.lumen-table__th--sortable:hover {
  color: var(--lumen-text);
}

.lumen-table__th-content {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.lumen-table__sort-icon {
  font-size: 0.625rem;
  opacity: 0.45;
}
.lumen-table__sort-icon--active {
  opacity: 1;
  color: var(--lumen-primary);
}

.lumen-table--striped tbody tr:nth-child(even) {
  background-color: var(--lumen-bg-subtle);
}

.lumen-table tbody tr:hover {
  background-color: var(--lumen-bg-subtle);
}

.lumen-table__row--selected {
  background-color: var(--lumen-primary-50);
}

.lumen-table__cell--selection {
  width: 2.5rem;
  text-align: center;
}

.lumen-table__cell--selection input[type='checkbox'] {
  accent-color: var(--lumen-primary);
}

.lumen-table__state-row td {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--lumen-text-muted);
}

.lumen-table__loading {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
