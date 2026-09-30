import { describe, expect, it } from 'vitest'
import {
  applyFilters,
  applySort,
  columnField,
  compareValues,
  escapeCsvCell,
  matchesFilter,
  resolveField,
  toCSV,
  visibleColumns,
} from './dataOps'
import type { TableColumn, TableFilter, TableRow } from './types'

const columns: TableColumn[] = [
  { key: 'name', title: 'Name' },
  { key: 'age', title: 'Age' },
  { key: 'city', title: 'City', hidden: true },
]

const rows: TableRow[] = [
  { id: 1, name: 'Cara', age: 31, city: 'Oslo', country: { name: 'Norway' } },
  { id: 2, name: 'Ben', age: 24, city: 'Paris', country: { name: 'France' } },
  { id: 3, name: 'Ada', age: 28, city: 'Rome', country: { name: 'Italy' } },
]

describe('resolveField', () => {
  it('resolves top-level and nested paths', () => {
    expect(resolveField(rows[0], 'name')).toBe('Cara')
    expect(resolveField(rows[0], 'country.name')).toBe('Norway')
  })

  it('returns undefined for missing segments', () => {
    expect(resolveField(rows[0], 'country.code')).toBeUndefined()
    expect(resolveField(rows[0], 'missing.deep.path')).toBeUndefined()
  })

  it('columnField falls back to key', () => {
    expect(columnField({ key: 'name' })).toBe('name')
    expect(columnField({ key: 'c', field: 'country.name' })).toBe('country.name')
  })

  it('visibleColumns excludes hidden columns', () => {
    expect(visibleColumns(columns).map((c) => c.key)).toEqual(['name', 'age'])
  })
})

describe('compareValues', () => {
  it('compares numbers numerically', () => {
    expect(compareValues(2, 10)).toBeLessThan(0)
    expect(compareValues(10, 2)).toBeGreaterThan(0)
    expect(compareValues(5, 5)).toBe(0)
  })

  it('sorts null/undefined last', () => {
    expect(compareValues(null, 1)).toBeGreaterThan(0)
    expect(compareValues(1, undefined)).toBeLessThan(0)
  })

  it('compares strings', () => {
    expect(compareValues('b', 'a')).toBeGreaterThan(0)
    expect(compareValues('a', 'b')).toBeLessThan(0)
  })
})

describe('applySort', () => {
  it('returns rows untouched with no descriptors', () => {
    expect(applySort(rows, [], columns)).toBe(rows)
  })

  it('sorts single column ascending and descending', () => {
    const asc = applySort(rows, [{ key: 'age', order: 'asc' }], columns)
    expect(asc.map((r) => r.name)).toEqual(['Ben', 'Ada', 'Cara'])
    const desc = applySort(rows, [{ key: 'age', order: 'desc' }], columns)
    expect(desc.map((r) => r.name)).toEqual(['Cara', 'Ada', 'Ben'])
  })

  it('applies multi-column sort with earlier descriptors taking precedence', () => {
    const dupes: TableRow[] = [
      { name: 'x', age: 30, city: 'b' },
      { name: 'y', age: 30, city: 'a' },
      { name: 'z', age: 20, city: 'c' },
    ]
    const sorted = applySort(
      dupes,
      [
        { key: 'age', order: 'asc' },
        { key: 'city', order: 'desc' },
      ],
      columns,
    )
    expect(sorted.map((r) => r.name)).toEqual(['z', 'x', 'y'])
  })

  it('sorts by nested field paths', () => {
    const sorted = applySort(rows, [{ key: 'countryName', order: 'asc' }], [
      { key: 'countryName', field: 'country.name' },
    ])
    expect(sorted.map((r) => r.name)).toEqual(['Ben', 'Ada', 'Cara'])
  })
})

describe('matchesFilter', () => {
  const f = (value: unknown, matchMode: TableFilter['matchMode']): TableFilter => ({
    value,
    matchMode,
  })

  it('ignores empty filter values', () => {
    for (const v of [null, undefined, '']) {
      expect(matchesFilter('abc', f(v, 'contains'))).toBe(true)
    }
  })

  it('handles string match modes case-insensitively', () => {
    expect(matchesFilter('Cara', f('ar', 'contains'))).toBe(true)
    expect(matchesFilter('Cara', f('AR', 'contains'))).toBe(true)
    expect(matchesFilter('Cara', f('Ca', 'startsWith'))).toBe(true)
    expect(matchesFilter('Cara', f('ra', 'endsWith'))).toBe(true)
    expect(matchesFilter('Cara', f('cara', 'equals'))).toBe(true)
    expect(matchesFilter('Cara', f('cara', 'notEquals'))).toBe(false)
    expect(matchesFilter('Ben', f('cara', 'contains'))).toBe(false)
  })

  it('handles numeric comparisons', () => {
    expect(matchesFilter(31, f(30, 'gt'))).toBe(true)
    expect(matchesFilter(31, f(31, 'gte'))).toBe(true)
    expect(matchesFilter(24, f(30, 'lt'))).toBe(true)
    expect(matchesFilter(24, f(24, 'lte'))).toBe(true)
    expect(matchesFilter(31, f(31, 'equals'))).toBe(true)
  })

  it('handles between and in', () => {
    expect(matchesFilter(28, f([25, 30], 'between'))).toBe(true)
    expect(matchesFilter(24, f([25, 30], 'between'))).toBe(false)
    expect(matchesFilter(31, f([25, null], 'between'))).toBe(true)
    expect(matchesFilter('Oslo', f(['Oslo', 'Rome'], 'in'))).toBe(true)
    expect(matchesFilter('Paris', f(['Oslo', 'Rome'], 'in'))).toBe(false)
  })

  it('handles date modes by calendar day', () => {
    const d = new Date(2026, 8, 15, 10, 30)
    expect(matchesFilter(d, f('2026-09-15', 'dateIs'))).toBe(true)
    expect(matchesFilter(d, f('2026-09-16', 'dateIs'))).toBe(false)
    expect(matchesFilter(d, f('2026-09-16', 'dateBefore'))).toBe(true)
    expect(matchesFilter(d, f('2026-09-14', 'dateAfter'))).toBe(true)
    expect(matchesFilter('not a date', f('2026-09-15', 'dateIs'))).toBe(false)
  })
})

describe('applyFilters', () => {
  it('ANDs per-column filters', () => {
    const out = applyFilters(rows, {
      columns,
      filters: {
        name: { value: 'a', matchMode: 'contains' },
        age: { value: 30, matchMode: 'lt' },
      },
    })
    expect(out.map((r) => r.name)).toEqual(['Ada'])
  })

  it('ignores unknown column keys', () => {
    const out = applyFilters(rows, {
      columns,
      filters: { nope: { value: 'x', matchMode: 'contains' } },
    })
    expect(out).toHaveLength(3)
  })

  it('applies the global filter across visible fields only', () => {
    // 'os' appears only in the hidden `city` column -> no match
    const out = applyFilters(rows, {
      columns,
      filters: { global: { value: 'os', matchMode: 'contains' } },
    })
    expect(out).toHaveLength(0)
    const out2 = applyFilters(rows, {
      columns,
      filters: { global: { value: 'ar', matchMode: 'contains' } },
    })
    expect(out2.map((r) => r.name)).toEqual(['Cara'])
  })

  it('respects globalFilterFields', () => {
    const out = applyFilters(rows, {
      columns,
      filters: { global: { value: 'oslo', matchMode: 'contains' } },
      globalFilterFields: ['city'],
    })
    expect(out.map((r) => r.name)).toEqual(['Cara'])
  })

  it('combines column and global filters', () => {
    const out = applyFilters(rows, {
      columns,
      filters: {
        age: { value: 30, matchMode: 'lt' },
        global: { value: 'a', matchMode: 'contains' },
      },
    })
    expect(out.map((r) => r.name)).toEqual(['Ada'])
  })
})

describe('toCSV', () => {
  it('exports visible, exportable columns with titles', () => {
    const csv = toCSV(rows, columns)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('Name,Age')
    expect(lines[1]).toBe('Cara,31')
    expect(lines).toHaveLength(4)
  })

  it('respects exportable: false and nested fields', () => {
    const csv = toCSV(rows, [
      { key: 'name', title: 'Name' },
      { key: 'country', field: 'country.name', title: 'Country' },
      { key: 'age', title: 'Age', exportable: false },
    ])
    expect(csv.split('\n')[0]).toBe('Name,Country')
    expect(csv).toContain('Norway')
  })

  it('quotes cells containing commas, quotes and newlines', () => {
    expect(escapeCsvCell('a,b')).toBe('"a,b"')
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""')
    expect(escapeCsvCell('line1\nline2')).toBe('"line1\nline2"')
    expect(escapeCsvCell('plain')).toBe('plain')
    expect(escapeCsvCell(null)).toBe('')
    expect(escapeCsvCell(undefined)).toBe('')
  })
})
