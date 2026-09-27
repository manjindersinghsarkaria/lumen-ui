import { describe, expect, it } from 'vitest'
import { version } from './index'

describe('lumen-ui entry point', () => {
  it('exports a semver version string', () => {
    expect(typeof version).toBe('string')
    expect(version).toMatch(/^\d+\.\d+\.\d+$/)
  })
})
