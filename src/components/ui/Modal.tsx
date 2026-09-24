// src/components/ui/Modal.tsx
import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="animate-fade-in absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-scale-in no-scrollbar relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-line bg-white p-6 shadow-[0_24px_48px_rgba(20,18,45,0.2)]">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-page/70 hover:text-ink"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
