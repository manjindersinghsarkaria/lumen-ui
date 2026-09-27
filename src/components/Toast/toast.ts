import { readonly, ref } from 'vue'

/**
 * Toast store + `useToast()` programmatic API.
 *
 * The store is module-level so toasts can be fired from anywhere (even
 * outside components). Render `<ToastHost />` once per app to display them.
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type ToastPlacement =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center'

export interface ToastOptions {
  /** Main toast text. */
  message: string
  /** Secondary text under the message. */
  description?: string
  /** Visual type. */
  type?: ToastType
  /** Auto-dismiss delay in ms. `0` disables auto-dismiss. Defaults to 4000. */
  duration?: number
  /** Show the dismiss button. Defaults to true. */
  closable?: boolean
  /** Overrides the ToastHost placement for this toast. */
  placement?: ToastPlacement
  /** Called when the toast is removed. */
  onClose?: () => void
}

export interface ToastItem {
  id: number
  message: string
  description?: string
  type: ToastType
  duration: number
  closable: boolean
  placement?: ToastPlacement
  onClose?: () => void
}

const DEFAULT_DURATION = 4000

let nextId = 1
const items = ref<ToastItem[]>([])
const timers = new Map<number, ReturnType<typeof setTimeout>>()

function clearTimer(id: number): void {
  const timer = timers.get(id)
  if (timer !== undefined) {
    clearTimeout(timer)
    timers.delete(id)
  }
}

function push(options: ToastOptions): number {
  const toast: ToastItem = {
    id: nextId++,
    message: options.message,
    description: options.description,
    type: options.type ?? 'info',
    duration: options.duration ?? DEFAULT_DURATION,
    closable: options.closable ?? true,
    placement: options.placement,
    onClose: options.onClose,
  }
  items.value = [...items.value, toast]
  if (toast.duration > 0) {
    timers.set(
      toast.id,
      setTimeout(() => close(toast.id), toast.duration),
    )
  }
  return toast.id
}

/** Remove a toast by id. Returns false when the id is unknown. */
function close(id: number): boolean {
  const index = items.value.findIndex((t) => t.id === id)
  if (index === -1) return false
  const [removed] = items.value.splice(index, 1)
  clearTimer(id)
  removed.onClose?.()
  return true
}

function closeAll(): void {
  for (const toast of [...items.value]) close(toast.id)
}

type ToastInput = string | ToastOptions
type ToastOverrides = Omit<ToastOptions, 'message' | 'type'>

function normalize(input: ToastInput, overrides?: ToastOverrides): ToastOptions {
  return typeof input === 'string' ? { ...overrides, message: input } : input
}

/**
 * Programmatic toast API. Works outside components too — just make sure a
 * `<ToastHost />` is mounted somewhere in the app.
 */
export function useToast() {
  return {
    /** Reactive toast list (rendered by `<ToastHost />`). */
    toasts: readonly(items),
    toast: (input: ToastInput, overrides?: ToastOverrides): number =>
      push(normalize(input, overrides)),
    success: (input: ToastInput, overrides?: ToastOverrides): number =>
      push({ ...normalize(input, overrides), type: 'success' }),
    error: (input: ToastInput, overrides?: ToastOverrides): number =>
      push({ ...normalize(input, overrides), type: 'error' }),
    info: (input: ToastInput, overrides?: ToastOverrides): number =>
      push({ ...normalize(input, overrides), type: 'info' }),
    warning: (input: ToastInput, overrides?: ToastOverrides): number =>
      push({ ...normalize(input, overrides), type: 'warning' }),
    close,
    closeAll,
  }
}
