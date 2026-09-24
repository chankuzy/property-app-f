import { useState } from 'react'
import { Bell, Send } from 'lucide-react'
import Modal from '../ui/Modal'
import { ApiError } from '../../lib/api'
import { showToast } from '../../lib/toast'
import { useAllTenants } from '../../hooks/useTenants'
import { sendTenantReminder } from '../../hooks/useNotificationLogs'

const inputClass =
  'mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13px] text-ink shadow-sm transition focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet-soft'

export default function SendReminderModal({
  open,
  onClose,
  onSent,
}: {
  open: boolean
  onClose: () => void
  onSent: () => void
}) {
  const { data: tenantsData, loading: tenantsLoading } = useAllTenants()
  const tenants = tenantsData?.data ?? []

  const [tenantId, setTenantId] = useState('')
  const [rentChargeId, setRentChargeId] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (!tenantId) {
      showToast('Select a tenant.', 'error')
      return
    }

    if (!rentChargeId && !message.trim()) {
      showToast('Provide a rent charge or a custom message.', 'error')
      return
    }

    setSubmitting(true)

    try {
      await sendTenantReminder({
        tenant_id: Number(tenantId),
        rent_charge_id: rentChargeId ? Number(rentChargeId) : undefined,
        message: message.trim() || undefined,
      })

      showToast('Reminder sent.', 'success')

      setTenantId('')
      setRentChargeId('')
      setMessage('')

      onSent()
      onClose()
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Could not reach the server.',
        'error',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Send tenant reminder">
      <div className="space-y-4">
        {/* Intro */}
        <div className="flex items-start gap-3 rounded-2xl border border-violet-soft/70 bg-violet-pale/40 p-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet shadow-sm">
            <Bell size={15} strokeWidth={1.8} />
          </div>

          <div>
            <p className="text-[12.5px] font-semibold text-ink">
              Send a rent reminder
            </p>
            <p className="mt-0.5 text-[11.5px] leading-4.5 text-muted">
              Choose a tenant and either attach a rent charge or write a custom message.
            </p>
          </div>
        </div>

        {/* Tenant */}
        <label className="block text-[12.5px] font-medium text-ink/80">
          Tenant <span className="text-rose-500">*</span>

          <select
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            className={inputClass}
            disabled={tenantsLoading}
          >
            <option value="" disabled>
              {tenantsLoading ? 'Loading tenants…' : 'Select a tenant'}
            </option>

            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.full_name} — {t.phone}
              </option>
            ))}
          </select>
        </label>

        {/* Rent charge */}
        <label className="block text-[12.5px] font-medium text-ink/80">
          Rent charge ID
          <span className="ml-1 font-normal text-muted">(optional)</span>

          <input
            type="number"
            min={1}
            value={rentChargeId}
            onChange={(e) => setRentChargeId(e.target.value)}
            className={inputClass}
            placeholder="e.g. 14"
          />

          <span className="mt-1 block text-[11px] font-normal text-muted">
            Attach an existing rent charge to include its context in the reminder.
          </span>
        </label>

        {/* Message */}
        <label className="block text-[12.5px] font-medium text-ink/80">
          Custom message
          {!rentChargeId && <span className="ml-1 text-rose-500">*</span>}

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={480}
            className={`${inputClass} resize-none`}
            placeholder="Please note your rent renewal is due next week."
          />

          <div className="mt-1 flex items-center justify-between text-[11px] font-normal text-muted">
            <span>
              {rentChargeId
                ? 'Optional when a rent charge is attached.'
                : 'Required when no rent charge is selected.'}
            </span>

            <span>{message.length}/480</span>
          </div>
        </label>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end gap-2 border-t border-line pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="rounded-xl px-4 py-2.5 text-[13px] font-medium text-ink/65 transition-colors hover:bg-page/70 hover:text-ink disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={submitting || tenantsLoading}
          onClick={submit}
          className="flex items-center gap-1.5 rounded-xl bg-ink px-5 py-2.5 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-ink/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
        >
          <Send size={13} strokeWidth={2} />
          {submitting ? 'Sending…' : 'Send reminder'}
        </button>
      </div>
    </Modal>
  )
}