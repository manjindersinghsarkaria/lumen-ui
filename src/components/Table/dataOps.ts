/**
 * Table data operations — pure functions for field resolution, multi-column
 * sorting, filtering (PrimeVue-style match modes) and CSV export.
 */
import type {
  TableColumn,
  TableFilter,
  TableFilterMatchMode,
  TableRow,
  TableSortDescriptor,
} from './types'

/** Resolve a (possibly nested, e.g. `country.name`) field path on a row. */
export function resolveField(row: TableRow, path: string): unknown {
  let current: unknown = row
  for (const segment of path.split('.')) {
    if (current === null || current === undefined) return undefined
    current = (current as Record<string, unknown>)[segment]
  }
  return current
}

/** The field path a column reads from. */
export function columnField(col: TableColumn): string {
  return col.field ?? col.key
}

/** Visible columns (hidden columns are excluded everywhere). */
export function visibleColumns(columns: TableColumn[]): TableColumn[] {
  return columns.filter((c) => !c.hidden)
}

function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === ''
}

/** Compare two values: numbers numerically, Dates chronologically, else as strings. */
export function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0
  if (a === null || a === undefined) return 1
  if (b === null || b === undefined) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  const da = a instanceof Date ? a.getTime() : NaN
  const db = b instanceof Date ? b.getTime() : NaN
  if (!Number.isNaN(da) && !Number.isNaN(db)) return da - db
  return String(a).localeCompare(String(b), undefined, { numeric: true })
}

/** Multi-column stable sort. Earlier descriptors take precedence. */
export function applySort(
  rows: TableRow[],
  descriptors: TableSortDescriptor[],
  columns: TableColumn[],
): TableRow[] {
  if (descriptors.length === 0) return rows
  const byKey = new Map(columns.map((c) => [c.key, c]))
  return [...rows].sort((ra, rb) => {
    for (const { key, order } of descriptors) {
      const col = byKey.get(key)
      const dir = order === 'asc' ? 1 : -1
      const result = dir * compareValues(resolveField(ra, columnField(col ?? { key })), resolveField(rb, columnField(col ?? { key })))
      if (result !== 0) return result
    }
    return 0
  })
}

function toDateOnly(value: unknown): number | null {
  let d: Date
  if (value instanceof Date) {
    d = value
  } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    // Parse calendar dates in local time so the day never shifts with UTC.
    const [y, m, day] = value.split('T')[0].split('-').map(Number)
    d = new Date(y, m - 1, day)
  } else {
    d = new Date(String(value))
  }
  if (Number.isNaN(d.getTime())) return null
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

function stringOf(value: unknown): string {
  return String(value ?? '').toLowerCase()
}

/** Test a single field value against a filter descriptor. */
export function matchesFilter(fieldValue: unknown, filter: TableFilter): boolean {
  const { value, matchMode } = filter
  if (isEmptyValue(value)) return true
  if (isEmptyValue(fieldValue)) return false

  const mode: TableFilterMatchMode = matchMode
  switch (mode) {
    case 'contains':
      return stringOf(fieldValue).includes(stringOf(value))
    case 'startsWith':
      return stringOf(fieldValue).startsWith(stringOf(value))
    case 'endsWith':
      return stringOf(fieldValue).endsWith(stringOf(value))
    case 'equals': {
      if (typeof fieldValue === 'number' && typeof value === 'number') return fieldValue === value
      return stringOf(fieldValue) === stringOf(value)
    }
    case 'notEquals':
      return !matchesFilter(fieldValue, { value, matchMode: 'equals' })
    case 'lt':
      return compareValues(fieldValue, value) < 0
    case 'lte':
      return compareValues(fieldValue, value) <= 0
    case 'gt':
      return compareValues(fieldValue, value) > 0
    case 'gte':
      return compareValues(fieldValue, value) >= 0
    case 'between': {
      if (!Array.isArray(value) || value.length < 2) return true
      const [min, max] = value
      if (isEmptyValue(min) && isEmptyValue(max)) return true
      if (!isEmptyValue(min) && compareValues(fieldValue, min) < 0) return false
      if (!isEmptyValue(max) && compareValues(fieldValue, max) > 0) return false
      return true
    }
    case 'in': {
      if (!Array.isArray(value)) return true
      return value.some((v) => matchesFilter(fieldValue, { value: v, matchMode: 'equals' }))
    }
    case 'dateIs': {
      const a = toDateOnly(fieldValue)
      const b = toDateOnly(value)
      return a !== null && b !== null && a === b
    }
    case 'dateBefore': {
      const a = toDateOnly(fieldValue)
      const b = toDateOnly(value)
      return a !== null && b !== null && a < b
    }
    case 'dateAfter': {
      const a = toDateOnly(fieldValue)
      const b = toDateOnly(value)
      return a !== null && b !== null && a > b
    }
    default:
      return true
  }
}

export interface FilterContext {
  columns: TableColumn[]
  /** Column-keyed filters plus the reserved `global` key. */
  filters: Record<string, TableFilter>
  /** Fields searched by the global filter. Defaults to visible column fields. */
  globalFilterFields?: string[]
}

/**
 * Apply per-column filters (AND) and the global filter (OR across fields).
 * Empty filter values are ignored.
 */
export function applyFilters(rows: TableRow[], ctx: FilterContext): TableRow[] {
  const cols = visibleColumns(ctx.columns)
  const byKey = new Map(cols.map((c) => [c.key, c]))
  const global = ctx.filters.global
  const globalFields =
    ctx.globalFilterFields ?? cols.map((c) => columnField(c))

  return rows.filter((row) => {
    for (const [key, filter] of Object.entries(ctx.filters)) {
      if (key === 'global') continue
      const col = byKey.get(key)
      if (!col) continue
      if (!matchesFilter(resolveField(row, columnField(col)), filter)) return false
    }
    if (global && !isEmptyValue(global.value)) {
      const hit = globalFields.some((field) =>
        matchesFilter(resolveField(row, field), { value: global.value, matchMode: 'contains' }),
      )
      if (!hit) return false
    }
    return true
  })
}

/** Escape one CSV cell per RFC 4180. */
export function escapeCsvCell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value)
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * Build a CSV string for the given rows: visible, exportable columns only,
 * header row from column titles.
 */
export function toCSV(rows: TableRow[], columns: TableColumn[]): string {
  const cols = visibleColumns(columns).filter((c) => c.exportable !== false)
  const header = cols.map((c) => escapeCsvCell(c.title ?? c.key)).join(',')
  const lines = rows.map((row) =>
    cols.map((c) => escapeCsvCell(resolveField(row, columnField(c)))).join(','),
  )
  return [header, ...lines].join('\n')
}
