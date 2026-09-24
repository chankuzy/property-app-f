// src/components/contacts/TenantRowActions.tsx
import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2, Power } from 'lucide-react'
import { api, ApiError } from '../../lib/api'
import { showToast } from '../../lib/toast'
import type { Tenant } from '../../types'

/**
 * Row-level actions for a tenant: toggle active/inactive status inline.
 * Edit/delete are stubbed (no DELETE /tenants/{id} in the contract — tenants
 * are deactivated via status, not removed) so only the status toggle is wired.
 */
export default function TenantRowActions({ tenant, onChanged }: { tenant: Tenant; onChanged: () => void }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function toggleStatus() {
    setBusy(true)
    setOpen(false)
    const nextStatus = tenant.status === 'active' ? 'inactive' : 'active'
    try {
      await api.put(`/tenants/${tenant.id}`, { status: nextStatus })
      showToast(`${tenant.full_name} marked ${nextStatus}.`, 'success')
      onChanged()
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not reach the server.'
      showToast(message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        aria-label={`Actions for ${tenant.full_name}`}
        disabled={busy}
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex h-8 w-8 items-center justify-center rounded-full border transition-all",
          open
            ? "border-violet-soft bg-violet-pale text-violet"
            : "border-transparent text-muted hover:border-line hover:bg-page/70 hover:text-ink",
          busy ? "opacity-50" : "",
        ].join(" ")}
      >
        <MoreHorizontal size={15} strokeWidth={1.8} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="animate-scale-in absolute right-0 top-9 z-20 w-44 origin-top-right rounded-2xl border border-line bg-white p-1.5 shadow-[0_12px_28px_rgba(20,18,45,0.12)]">
            <button
              type="button"
              onClick={toggleStatus}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[12.5px] text-ink/80 transition-colors hover:bg-page/70"
            >
              <Power size={14} strokeWidth={1.8} />
              {tenant.status === "active" ? "Mark inactive" : "Mark active"}
            </button>
            <button
              type="button"
              disabled
              className="flex w-full cursor-not-allowed items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[12.5px] text-ink/30"
            >
              <Pencil size={14} strokeWidth={1.8} />
              Edit
            </button>
            <button
              type="button"
              disabled
              className="flex w-full cursor-not-allowed items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[12.5px] text-ink/30"
            >
              <Trash2 size={14} strokeWidth={1.8} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
