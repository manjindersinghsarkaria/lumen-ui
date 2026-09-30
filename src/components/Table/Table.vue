<script setup lang="ts">
import { computed, ref, useSlots, watch } from 'vue'
import { useI18n } from '../../i18n'
import { Spinner } from '../Spinner'
import { Input } from '../Input'
import { Button } from '../Button'
import { Pagination } from '../Pagination'
import {
  applyFilters,
  applySort,
  columnField,
  resolveField,
  toCSV,
  visibleColumns,
} from './dataOps'
import { GLOBAL_FILTER_KEY } from './types'
import type {
  TableColumn,
  TableFilter,
  TableFilters,
  TableProps,
  TableRow,
  TableSortDescriptor,
} from './types'

/**
 * Table — data table with multi-column sorting, per-column + global
 * filtering, client-side pagination, row selection, CSV export, and
 * loading / empty states.
 *
 * Sorting and filtering are uncontrolled by default (emitting
 * `update:sortDescriptors` / `update:filters`); bind them with v-model
 * for controlled usage.
 */

const props = withDefaults(defineProps<TableProps>(), {
  rowKey: undefined,
  selectable: false,
  selected: () => [],
  loading: false,
  striped: false,
  bordered: false,
  multiSort: false,
  sortDescriptors: undefined,
  defaultSort: () => [],
  paginator: false,
  rowsPerPage: 10,
  rowsPerPageOptions: () => [10, 25, 50],
  paginatorPosition: 'bottom',
  showPageReport: true,
  filters: undefined,
  globalFilterFields: undefined,
  showGlobalFilter: false,
  exportFilename: 'lumen-table',
  showExportButton: false,
  ariaLabel: undefined,
})

const emit = defineEmits<{
  'update:selected': [selected: (string | number)[]]
  'selection-change': [selected: (string | number)[], rows: TableRow[]]
  /** Single-sort mode: the toggled column, or [null, null] when cleared. */
  'sort-change': [key: string | null, order: 'asc' | 'desc' | null]
  /** Multi-sort mode: the full descriptor list after each change. */
  'multi-sort-change': [descriptors: TableSortDescriptor[]]
  'update:sortDescriptors': [descriptors: TableSortDescriptor[]]
  'update:filters': [filters: TableFilters]
  'filter-change': [filters: TableFilters]
  'update:page': [page: number]
  'update:rowsPerPage': [rowsPerPage: number]
  'page-change': [page: number, rowsPerPage: number]
}>()

const { t } = useI18n()
const slots = useSlots()

/* ---------- columns ---------- */

const visibleCols = computed(() => visibleColumns(props.columns))
const columnCount = computed(() => visibleCols.value.length + (props.selectable ? 1 : 0))
const showFilterRow = computed(() => visibleCols.value.some((c) => c.filterable))

function columnByKey(key: string): TableColumn | undefined {
  return props.columns.find((c) => c.key === key)
}

function colWidth(col: TableColumn): string | undefined {
  if (col.width === undefined) return undefined
  return typeof col.width === 'number' ? `${col.width}px` : col.width
}

function colMinWidth(col: TableColumn): string | undefined {
  if (col.minWidth === undefined) return undefined
  return typeof col.minWidth === 'number' ? `${col.minWidth}px` : col.minWidth
}

/* ---------- sorting ---------- */

const sortDescriptors = ref<TableSortDescriptor[]>([
  ...(props.sortDescriptors ?? props.defaultSort ?? []),
])
watch(
  () => props.sortDescriptors,
  (next) => {
    if (next) sortDescriptors.value = next.map((d) => ({ ...d }))
  },
)

function descriptorFor(key: string): TableSortDescriptor | undefined {
  return sortDescriptors.value.find((d) => d.key === key)
}

function sortPriority(key: string): number {
  return sortDescriptors.value.findIndex((d) => d.key === key)
}

function toggleSort(key: string) {
  if (!props.multiSort) {
    const cur = sortDescriptors.value[0]
    if (!cur || cur.key !== key) {
      sortDescriptors.value = [{ key, order: 'asc' }]
      emit('update:sortDescriptors', [{ key, order: 'asc' }])
      emit('sort-change', key, 'asc')
    } else if (cur.order === 'asc') {
      sortDescriptors.value = [{ key, order: 'desc' }]
      emit('update:sortDescriptors', [{ key, order: 'desc' }])
      emit('sort-change', key, 'desc')
    } else {
      sortDescriptors.value = []
      emit('update:sortDescriptors', [])
      emit('sort-change', null, null)
    }
    resetPage()
    return
  }
  const idx = sortPriority(key)
  const next = sortDescriptors.value.map((d) => ({ ...d }))
  if (idx === -1) next.push({ key, order: 'asc' })
  else if (next[idx].order === 'asc') next[idx] = { key, order: 'desc' }
  else next.splice(idx, 1)
  sortDescriptors.value = next
  const snapshot = next.map((d) => ({ ...d }))
  emit('update:sortDescriptors', snapshot)
  emit('multi-sort-change', snapshot.map((d) => ({ ...d })))
  resetPage()
}

function ariaSort(col: TableColumn): 'none' | 'ascending' | 'descending' | undefined {
  if (!col.sortable) return undefined
  const d = descriptorFor(col.key)
  if (!d) return 'none'
  return d.order === 'asc' ? 'ascending' : 'descending'
}

/* ---------- filtering ---------- */

const filterState = ref<TableFilters>({ ...(props.filters ?? {}) })
watch(
  () => props.filters,
  (next) => {
    filterState.value = { ...(next ?? {}) }
    resetPage()
  },
)

function filterFor(key: string): TableFilter {
  return (
    filterState.value[key] ?? {
      value: '',
      matchMode: columnByKey(key)?.filterMatchMode ?? 'contains',
    }
  )
}

function updateFilters(next: TableFilters) {
  filterState.value = next
  emit('update:filters', { ...next })
  emit('filter-change', { ...next })
  resetPage()
}

function setFilter(key: string, patch: Partial<TableFilter>) {
  updateFilters({ ...filterState.value, [key]: { ...filterFor(key), ...patch } })
}

function filterCallbackFor(key: string) {
  return (patch: Partial<TableFilter> = {}) => setFilter(key, patch)
}

const globalFilterValue = computed<string>({
  get: () => {
    const v = filterState.value[GLOBAL_FILTER_KEY]?.value
    return v === null || v === undefined ? '' : String(v)
  },
  set: (v: string) => setFilter(GLOBAL_FILTER_KEY, { value: v, matchMode: 'contains' }),
})

const hasActiveFilters = computed(() =>
  Object.values(filterState.value).some(
    (f) => f.value !== null && f.value !== undefined && f.value !== '',
  ),
)

/* ---------- data pipeline: filter -> sort -> paginate ---------- */

const filteredRows = computed(() =>
  applyFilters(props.rows, {
    columns: props.columns,
    filters: filterState.value,
    globalFilterFields: props.globalFilterFields,
  }),
)

const sortedRows = computed(() =>
  applySort(filteredRows.value, sortDescriptors.value, props.columns),
)

const page = ref(1)
const pageSize = ref(props.rowsPerPage ?? 10)
watch(
  () => props.rowsPerPage,
  (v) => {
    if (v !== undefined) {
      pageSize.value = v
      page.value = 1
    }
  },
)
watch(
  () => props.rows,
  () => {
    page.value = 1
  },
)

const totalRecords = computed(() => sortedRows.value.length)
const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalRecords.value / Math.max(1, pageSize.value))),
)
watch(totalPages, (t) => {
  if (page.value > t) page.value = t
})

function resetPage() {
  page.value = 1
}

const pagedRows = computed(() => {
  if (!props.paginator) return sortedRows.value
  const start = (page.value - 1) * pageSize.value
  return sortedRows.value.slice(start, start + pageSize.value)
})

function setPage(p: number) {
  page.value = Math.min(Math.max(1, p), totalPages.value)
  emit('update:page', page.value)
  emit('page-change', page.value, pageSize.value)
}

function setPageSize(size: number) {
  pageSize.value = Math.max(1, size)
  page.value = 1
  emit('update:rowsPerPage', pageSize.value)
  emit('page-change', page.value, pageSize.value)
}

const showTopPaginator = computed(
  () => props.paginator && (props.paginatorPosition === 'top' || props.paginatorPosition === 'both'),
)
const showBottomPaginator = computed(
  () =>
    props.paginator && (props.paginatorPosition === 'bottom' || props.paginatorPosition === 'both'),
)

const pageReportText = computed(() => {
  if (totalRecords.value === 0)
    return t('table.pageReport', { first: 0, last: 0, total: 0 })
  const first = (page.value - 1) * pageSize.value + 1
  const last = Math.min(page.value * pageSize.value, totalRecords.value)
  return t('table.pageReport', { first, last, total: totalRecords.value })
})

/* ---------- selection ---------- */

function rowKeyOf(row: TableRow, index: number): string | number {
  if (typeof props.rowKey === 'function') return props.rowKey(row, index)
  if (typeof props.rowKey === 'string') {
    const v = row[props.rowKey]
    if (typeof v === 'string' || typeof v === 'number') return v
  }
  return index
}

/** Stable row identity regardless of sorting / filtering / pagination. */
const rowKeys = computed(() => {
  const map = new Map<TableRow, string | number>()
  props.rows.forEach((row, index) => {
    if (!map.has(row)) map.set(row, rowKeyOf(row, index))
  })
  return map
})

function keyOfRow(row: TableRow): string | number {
  return rowKeys.value.get(row) ?? -1
}

const selectedSet = computed(() => new Set(props.selected))

function setSelected(keys: (string | number)[]) {
  emit('update:selected', keys)
  const keySet = new Set(keys)
  emit(
    'selection-change',
    keys,
    props.rows.filter((row) => keySet.has(keyOfRow(row))),
  )
}

function toggleRow(row: TableRow) {
  const key = keyOfRow(row)
  const next = new Set(selectedSet.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  setSelected([...next])
}

/** Header checkbox toggles the rows currently rendered (page, or all rows). */
const selectionScope = computed(() => (props.paginator ? pagedRows.value : sortedRows.value))

const allSelected = computed(
  () => selectionScope.value.length > 0 && selectionScope.value.every((row) => selectedSet.value.has(keyOfRow(row))),
)
const someSelected = computed(
  () =>
    !allSelected.value && selectionScope.value.some((row) => selectedSet.value.has(keyOfRow(row))),
)

function toggleAll() {
  if (allSelected.value) {
    const scopeKeys = new Set(selectionScope.value.map(keyOfRow))
    setSelected([...selectedSet.value].filter((k) => !scopeKeys.has(k)))
  } else {
    const next = new Set(selectedSet.value)
    selectionScope.value.forEach((row) => next.add(keyOfRow(row)))
    setSelected([...next])
  }
}

/* ---------- CSV export ---------- */

function exportCSV() {
  const csv = toCSV(sortedRows.value, props.columns)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.exportFilename ?? 'lumen-table'}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

defineExpose({ exportCSV })

/* ---------- misc ---------- */

const hasToolbar = computed(
  () => props.showGlobalFilter || props.showExportButton || !!slots.header,
)

function cellText(row: TableRow, col: TableColumn): string {
  const v = resolveField(row, columnField(col))
  return v === null || v === undefined ? '' : String(v)
}

const emptyText = computed(() =>
  hasActiveFilters.value && props.rows.length > 0 ? t('table.noResults') : t('common.noData'),
)
</script>

<template>
  <div class="lumen-table__root">
    <div v-if="hasToolbar" class="lumen-table__toolbar">
      <div class="lumen-table__toolbar-start">
        <slot name="header" />
      </div>
      <div class="lumen-table__toolbar-end">
        <Input
          v-if="showGlobalFilter"
          v-model="globalFilterValue"
          :placeholder="t('table.globalFilterPlaceholder')"
          :aria-label="t('common.search')"
          size="sm"
        />
        <Button v-if="showExportButton" size="sm" @click="exportCSV()">
          {{ t('table.exportCsv') }}
        </Button>
      </div>
    </div>

    <div v-if="showTopPaginator" class="lumen-table__paginator">
      <span v-if="showPageReport" class="lumen-table__page-report">{{ pageReportText }}</span>
      <Pagination
        :page="page"
        :page-size="pageSize"
        :total="totalRecords"
        :page-sizes="rowsPerPageOptions"
        @update:page="setPage"
        @update:page-size="setPageSize"
      />
    </div>

    <div class="lumen-table__wrapper" :class="{ 'lumen-table__wrapper--bordered': bordered }">
      <table
        class="lumen-table"
        :class="{ 'lumen-table--striped': striped }"
        :aria-label="ariaLabel"
      >
        <thead>
          <tr>
            <th v-if="selectable" class="lumen-table__cell--selection" scope="col">
              <input
                type="checkbox"
                :checked="allSelected"
                :indeterminate="someSelected"
                :aria-label="t('table.selectAll')"
                @change="toggleAll"
              />
            </th>
            <th
              v-for="col in visibleCols"
              :key="col.key"
              scope="col"
              :class="{ 'lumen-table__th--sortable': col.sortable }"
              :style="{
                width: colWidth(col),
                minWidth: colMinWidth(col),
                textAlign: col.align ?? 'left',
              }"
              :aria-sort="ariaSort(col)"
              :tabindex="col.sortable ? 0 : undefined"
              @click="col.sortable ? toggleSort(col.key) : undefined"
              @keydown.enter="col.sortable ? toggleSort(col.key) : undefined"
              @keydown.space.prevent="col.sortable ? toggleSort(col.key) : undefined"
            >
              <span class="lumen-table__th-content">
                <slot :name="`header-${col.key}`" :column="col">{{ col.title ?? col.key }}</slot>
                <span
                  v-if="col.sortable"
                  class="lumen-table__sort-icon"
                  :class="{ 'lumen-table__sort-icon--active': descriptorFor(col.key) }"
                  aria-hidden="true"
                >
                  {{
                    descriptorFor(col.key)
                      ? descriptorFor(col.key)!.order === 'asc'
                        ? '▲'
                        : '▼'
                      : '△'
                  }}
                </span>
                <span
                  v-if="multiSort && sortPriority(col.key) >= 0"
                  class="lumen-table__sort-badge"
                  aria-hidden="true"
                >
                  {{ sortPriority(col.key) + 1 }}
                </span>
              </span>
            </th>
          </tr>
          <tr v-if="showFilterRow" class="lumen-table__filter-row">
            <th v-if="selectable" class="lumen-table__cell--selection" scope="col" />
            <th v-for="col in visibleCols" :key="`filter-${col.key}`" scope="col">
              <slot
                :name="`filter-${col.key}`"
                :column="col"
                :filterModel="filterFor(col.key)"
                :filterCallback="filterCallbackFor(col.key)"
              >
                <Input
                  v-if="col.filterable"
                  :model-value="String(filterFor(col.key).value ?? '')"
                  :placeholder="col.filterPlaceholder"
                  :aria-label="
                    t('table.filterByColumn', { column: col.title ?? col.key })
                  "
                  size="sm"
                  @update:model-value="(v) => setFilter(col.key, { value: v })"
                />
              </slot>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="lumen-table__state-row">
            <td :colspan="columnCount">
              <span class="lumen-table__loading">
                <Spinner size="sm" />
                {{ t('common.loading') }}
              </span>
            </td>
          </tr>
          <tr v-else-if="pagedRows.length === 0" class="lumen-table__state-row">
            <td :colspan="columnCount">
              <slot name="empty">{{ emptyText }}</slot>
            </td>
          </tr>
          <template v-else>
            <tr
              v-for="(row, i) in pagedRows"
              :key="keyOfRow(row)"
              :class="{ 'lumen-table__row--selected': selectedSet.has(keyOfRow(row)) }"
            >
              <td v-if="selectable" class="lumen-table__cell--selection">
                <input
                  type="checkbox"
                  :checked="selectedSet.has(keyOfRow(row))"
                  :aria-label="t('table.selectRow')"
                  @change="toggleRow(row)"
                />
              </td>
              <td
                v-for="col in visibleCols"
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
        <tfoot v-if="$slots.footer">
          <tr class="lumen-table__footer-row">
            <td :colspan="columnCount">
              <slot name="footer" />
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div v-if="showBottomPaginator" class="lumen-table__paginator">
      <span v-if="showPageReport" class="lumen-table__page-report">{{ pageReportText }}</span>
      <Pagination
        :page="page"
        :page-size="pageSize"
        :total="totalRecords"
        :page-sizes="rowsPerPageOptions"
        @update:page="setPage"
        @update:page-size="setPageSize"
      />
    </div>
  </div>
</template>

<style>
.lumen-table__root {
  width: 100%;
}

.lumen-table__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.lumen-table__toolbar-end {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.lumen-table__paginator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin: 0.75rem 0;
}

.lumen-table__page-report {
  font-size: 0.8125rem;
  color: var(--lumen-text-muted);
  white-space: nowrap;
}

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
.lumen-table__th--sortable:focus-visible {
  outline: 2px solid var(--lumen-primary);
  outline-offset: -2px;
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

.lumen-table__sort-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1rem;
  height: 1rem;
  padding: 0 0.2rem;
  border-radius: 999px;
  background-color: var(--lumen-primary);
  color: #fff;
  font-size: 0.625rem;
  font-weight: 700;
  line-height: 1;
}

.lumen-table__filter-row th {
  padding: 0.375rem 0.75rem;
  background-color: var(--lumen-surface);
  font-weight: 400;
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

.lumen-table__footer-row td {
  font-weight: 600;
  background-color: var(--lumen-bg-subtle);
}
</style>
