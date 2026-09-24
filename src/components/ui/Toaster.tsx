// src/components/ui/Toaster.tsx
import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { subscribeToasts } from '../../lib/toast'

interface Toast {
  id: number
  type: 'success' | 'error'
  message: string
}

export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => subscribeToasts(setToasts), [])

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:left-auto sm:right-4 sm:items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-fade-up pointer-events-auto flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-[13px] font-medium text-ink shadow-[0_12px_28px_rgba(20,18,45,0.12)]"
        >
          {t.type === 'success' ? (
            <CheckCircle2 size={16} strokeWidth={2} className="shrink-0 text-good-text" />
          ) : (
            <XCircle size={16} strokeWidth={2} className="shrink-0 text-rose-500" />
          )}
          {t.message}
        </div>
      ))}
    </div>
  )
}