import { afterEach, vi } from 'vitest'

/**
 * Fail the run on any unexpected console.error / console.warn.
 *
 * Components must not log noise during tests — a warning usually means a real
 * problem (bad prop, missing key, failed assertion inside Vue). If a test
 * intentionally triggers a warning, it must wrap the noisy section and clear
 * the spy buffer itself (see `expectNoConsoleNoise` helpers in component tests).
 */

const calls: { method: 'error' | 'warn'; args: unknown[] }[] = []

function hook(method: 'error' | 'warn') {
  const spy = vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
    calls.push({ method, args })
  })
  return spy
}

hook('error')
hook('warn')

afterEach(() => {
  if (calls.length > 0) {
    const lines = calls
      .splice(0)
      .map(({ method, args }) => `  [console.${method}] ${args.map((a) => String(a)).join(' ')}`)
    throw new Error(`Unexpected console.error/warn during test:\n${lines.join('\n')}`)
  }
})
