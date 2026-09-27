import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ToastHost, useToast } from './index'

function bodyToast(selector = '.lumen-toast'): Element | null {
  return document.body.querySelector(selector)
}

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useToast().closeAll()
  })

  afterEach(() => {
    useToast().closeAll()
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('pushes a toast with the success helper', () => {
    const { success, toasts } = useToast()
    const id = success('Saved')
    expect(typeof id).toBe('number')
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({ message: 'Saved', type: 'success' })
  })

  it('accepts a full options object and per-type helpers', () => {
    const t = useToast()
    t.error({ message: 'Failed', description: 'Try again', duration: 0 })
    t.info('Note')
    t.warning('Careful')
    expect(t.toasts.value.map((x) => x.type)).toEqual(['error', 'info', 'warning'])
    expect(t.toasts.value[0].description).toBe('Try again')
  })

  it('auto-dismisses after the duration', () => {
    const { toast, toasts } = useToast()
    toast({ message: 'Soon gone', duration: 100 })
    expect(toasts.value).toHaveLength(1)
    vi.advanceTimersByTime(100)
    expect(toasts.value).toHaveLength(0)
  })

  it('does not auto-dismiss when duration is 0', () => {
    const { toast, toasts } = useToast()
    toast({ message: 'Stays', duration: 0 })
    vi.advanceTimersByTime(60_000)
    expect(toasts.value).toHaveLength(1)
  })

  it('close() removes the toast and fires onClose', () => {
    const { toast, close, toasts } = useToast()
    let closed = false
    const id = toast({ message: 'Bye', onClose: () => (closed = true) })
    expect(close(id)).toBe(true)
    expect(closed).toBe(true)
    expect(toasts.value).toHaveLength(0)
    expect(close(9999)).toBe(false)
  })

  it('closeAll() clears every toast', () => {
    const t = useToast()
    t.success('One')
    t.error('Two')
    t.closeAll()
    expect(t.toasts.value).toHaveLength(0)
  })
})

describe('ToastHost', () => {
  let hosts: ReturnType<typeof mount>[] = []

  function mountHost(props: Record<string, unknown> = {}) {
    const wrapper = mount(ToastHost, { props })
    hosts.push(wrapper)
    return wrapper
  }

  beforeEach(() => {
    vi.useFakeTimers()
    useToast().closeAll()
  })

  afterEach(() => {
    // Unmount hosts BEFORE clearing toasts / wiping body, or their stale
    // Teleport anchors crash on the next render.
    for (const h of hosts) h.unmount()
    hosts = []
    useToast().closeAll()
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('renders toasts fired via useToast with type styling', async () => {
    mountHost()
    useToast().success('Saved', { description: 'All changes stored.' })
    await Promise.resolve()
    const el = bodyToast()!
    expect(el.classList.contains('lumen-toast--success')).toBe(true)
    expect(el.querySelector('.lumen-toast__message')!.textContent).toBe('Saved')
    expect(el.querySelector('.lumen-toast__description')!.textContent).toBe('All changes stored.')
    expect(el.getAttribute('role')).toBe('status')
  })

  it('dismisses via the close button', async () => {
    mountHost()
    useToast().info('Hello')
    await Promise.resolve()
    const btn = bodyToast()!.querySelector<HTMLButtonElement>('.lumen-toast__close')!
    expect(btn.getAttribute('aria-label')).toBe('Dismiss notification')
    btn.click()
    await Promise.resolve()
    expect(bodyToast()).toBeNull()
  })

  it('hides the close button when closable is false', async () => {
    mountHost()
    useToast().toast({ message: 'Quiet', closable: false, duration: 0 })
    await Promise.resolve()
    expect(bodyToast()!.querySelector('.lumen-toast__close')).toBeNull()
  })

  it('places toasts in the host placement by default', async () => {
    mountHost({ placement: 'bottom-left' })
    useToast().warning('Watch out')
    await Promise.resolve()
    const container = document.body.querySelector('.lumen-toast__container')!
    expect(container.classList.contains('lumen-toast__container--bottom-left')).toBe(true)
  })

  it('lets a toast override the host placement', async () => {
    mountHost()
    useToast().info('Over here', { placement: 'top-center' })
    await Promise.resolve()
    const container = document.body.querySelector('.lumen-toast__container')!
    expect(container.classList.contains('lumen-toast__container--top-center')).toBe(true)
  })
})
