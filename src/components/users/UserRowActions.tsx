import { useState } from 'react'
import { MoreVertical, Ban, CheckCircle2 } from 'lucide-react'
import { api, ApiError } from '../../lib/api'
import { showToast } from '../../lib/toast'
import type { StaffUser } from '../../types'

export default function UserRowActions({
  user,
  onChanged,
}: {
  user: StaffUser
  onChanged: () => void
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function toggleActive() {
    setBusy(true)

    try {
      await api.put(`/users/${user.id}`, {
        is_active: !user.is_active,
      })

      showToast(
        `${user.name} is now ${user.is_active ? 'inactive' : 'active'}.`,
        'success',
      )

      onChanged()
    } catch (err) {
      showToast(
        err instanceof ApiError
          ? err.message
          : 'Could not reach the server.',
        'error',
      )
    } finally {
      setBusy(false)
      setOpen(false)
    }
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        disabled={busy}
        aria-label={`Actions for ${user.name}`}
        onClick={() => setOpen((v) => !v)}
        className={[
          'flex h-8 w-8 items-center justify-center rounded-xl border transition-all',
          open
            ? 'border-violet-soft bg-violet-pale text-violet'
            : 'border-transparent text-muted hover:border-line hover:bg-page/70 hover:text-ink',
          busy ? 'opacity-50' : '',
        ].join(' ')}
      >
        <MoreVertical size={15} strokeWidth={1.8} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          <div className="animate-scale-in absolute right-0 top-10 z-20 w-48 origin-top-right rounded-2xl border border-line bg-white p-1.5 shadow-[0_12px_28px_rgba(20,18,45,0.12)]">
            <button
              type="button"
              onClick={toggleActive}
              disabled={busy}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2.5 text-left text-[12.5px] font-medium text-ink/75 transition-colors hover:bg-page/70 hover:text-ink disabled:opacity-50"
            >
              {user.is_active ? (
                <Ban size={14} strokeWidth={1.8} />
              ) : (
                <CheckCircle2 size={14} strokeWidth={1.8} />
              )}

              {user.is_active ? 'Deactivate account' : 'Activate account'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}