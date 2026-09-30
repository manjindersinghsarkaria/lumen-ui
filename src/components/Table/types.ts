/**
 * Table types — shared between Table.vue, data ops, tests and stories.
 */

export type TableSortOrder = 'asc' | 'desc'

export interface TableSortDescriptor {
  key: string
  order: TableSortOrder
}

export type TableFilterMatchMode =
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'equals'
  | 'notEquals'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'between'
  | 'in'
  | 'dateIs'
  | 'dateBefore'
  | 'dateAfter'

export interface TableFilter {
  value: unknown
  matchMode: TableFilterMatchMode
}

/** Filter state keyed by column key; the reserved key `global` holds the global search. */
export type TableFilters = Record<string, TableFilter>

export const GLOBAL_FILTER_KEY = 'global'

export interface TableColumn {
  /** Key into each row object (also the default field path and slot suffix). */
  key: string
  /** Nested field path, e.g. `country.name`. Defaults to `key`. */
  field?: string
  /** Header label (defaults to the key). */
  title?: string
  /** Whether clicking the header sorts by this column. */
  sortable?: boolean
  /** Cell text alignment. */
  align?: 'left' | 'center' | 'right'
  /** Column width (CSS value or px number). */
  width?: string | number
  /** Minimum column width (CSS value or px number). */
  minWidth?: string | number
  /** Show a filter input for this column in the filter row. */
  filterable?: boolean
  /** Default match mode for this column's filter. Defaults to `contains`. */
  filterMatchMode?: TableFilterMatchMode
  /** Placeholder for this column's filter input. */
  filterPlaceholder?: string
  /** Hide the column entirely (header, body, export, global search). */
  hidden?: boolean
  /** Include the column in CSV export. Defaults to `true`. */
  exportable?: boolean
}

export type TableRow = Record<string, unknown>

export type PaginatorPosition = 'top' | 'bottom' | 'both'

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
  /** Enable multi-column sorting. Default `false` (single-column sort). */
  multiSort?: boolean
  /** Controlled sort descriptors (v-model:sortDescriptors). */
  sortDescriptors?: TableSortDescriptor[]
  /** Initial sort descriptors for uncontrolled usage. */
  defaultSort?: TableSortDescriptor[]
  /** Enable client-side pagination. */
  paginator?: boolean
  /** Initial rows per page (v-model:rowsPerPage). */
  rowsPerPage?: number
  /** Rows-per-page options shown in the paginator. */
  rowsPerPageOptions?: number[]
  /** Where the paginator renders. Default `bottom`. */
  paginatorPosition?: PaginatorPosition
  /** Show the "1–10 of 42" page report next to the paginator. Default `true`. */
  showPageReport?: boolean
  /** Filter state, keyed by column key (`global` = global search). v-model:filters. */
  filters?: TableFilters
  /** Fields searched by the global filter. Defaults to visible column fields. */
  globalFilterFields?: string[]
  /** Render a built-in global search input above the table. Default `false`. */
  showGlobalFilter?: boolean
  /** File name (without extension) used by CSV export. Default `lumen-table`. */
  exportFilename?: string
  /** Render a built-in "Export CSV" button in the table header area. Default `false`. */
  showExportButton?: boolean
  /** Accessible label for the table. */
  ariaLabel?: string
}
