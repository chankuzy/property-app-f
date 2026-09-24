// src/lib/toast.ts
type ToastKind = 'success' | 'error'
interface Toast {
  id: number
  type: ToastKind
  message: string
}

let toasts: Toast[] = []
let listeners: Array<(toasts: Toast[]) => void> = []
let nextId = 1

function emit() {
  listeners.forEach((l) => l(toasts))
}

export function showToast(message: string, type: ToastKind = 'success') {
  const id = nextId++
  toasts = [...toasts, { id, type, message }]
  emit()
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    emit()
  }, 3500)
}

export function subscribeToasts(listener: (toasts: Toast[]) => void) {
  listeners.push(listener)
  listener(toasts)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}