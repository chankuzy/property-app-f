// src/components/rentcharges/RentChargeRowActions.tsx
import { useState } from 'react'
import { MoreVertical, Wallet, FileX, History } from 'lucide-react'
import Modal from '../ui/Modal'
import { api, ApiError } from '../../lib/api'
import { showToast } from '../../lib/toast'
import { usePayments } from '../../hooks/usePayments'
import type { PaymentMethod, RentCharge } from '../../types'

type ModalKind = null | 'payment' | 'waive' | 'history'

export default function RentChargeRowActions({ charge, onChanged }: { charge: RentCharge; onChanged: () => void }) {
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState<ModalKind>(null)
  const settled = charge.status === 'paid' || charge.status === 'waived'

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-page/70 hover:text-ink"
      >
        <MoreVertical size={15} strokeWidth={1.8} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="animate-scale-in absolute right-0 top-9 z-20 w-44 origin-top-right rounded-2xl border border-line bg-white p-1.5 shadow-[0_12px_28px_rgba(20,18,45,0.12)]">
            <MenuItem
              icon={Wallet}
              label="Record payment"
              disabled={settled}
              onClick={() => { setModal('payment'); setOpen(false) }}
            />
            <MenuItem
              icon={History}
              label="Payment history"
              onClick={() => { setModal('history'); setOpen(false) }}
            />
            <MenuItem
              icon={FileX}
              label="Waive charge"
              tone="danger"
              disabled={settled}
              onClick={() => { setModal('waive'); setOpen(false) }}
            />
          </div>
        </>
      )}

      <PaymentModal open={modal === 'payment'} onClose={() => setModal(null)} charge={charge} onChanged={onChanged} />
      <WaiveModal open={modal === 'waive'} onClose={() => setModal(null)} charge={charge} onChanged={onChanged} />
      <HistoryModal open={modal === 'history'} onClose={() => setModal(null)} charge={charge} />
    </div>
  )
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  disabled,
  tone = 'default',
}: {
  icon: typeof Wallet
  label: string
  onClick: () => void
  disabled?: boolean
  tone?: 'default' | 'danger'
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        'flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[12.5px] transition-colors hover:bg-page/70 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
        tone === 'danger' ? 'text-rose-600' : 'text-ink/80',
      ].join(' ')}
    >
      <Icon size={14} strokeWidth={1.8} />
      {label}
    </button>
  )
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-violet-soft'

const methods: PaymentMethod[] = ['cash', 'bank_transfer', 'pos', 'cheque', 'other']

function PaymentModal({
  open,
  onClose,
  charge,
  onChanged,
}: {
  open: boolean
  onClose: () => void
  charge: RentCharge
  onChanged: () => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [amount, setAmount] = useState(charge.balance)
  const [paidAt, setPaidAt] = useState(today)
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (!amount || Number(amount) <= 0) return showToast('Enter a valid amount.', 'error')
    if (!paidAt) return showToast('Payment date is required.', 'error')
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = { amount: Number(amount), paid_at: paidAt, method }
      if (reference) payload.reference = reference
      if (notes) payload.notes = notes
      await api.post(`/rent-charges/${charge.id}/payments`, payload)
      showToast('Payment recorded.', 'success')
      onChanged()
      onClose()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not reach the server.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Record payment">
      <p className="text-[12.5px] text-muted">
        Balance outstanding: ₦{Number(charge.balance).toLocaleString()}
      </p>

      <label className="mt-4 block text-[12.5px] font-medium text-ink/80">
        Amount (₦) <span className="text-rose-500">*</span>
        <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
      </label>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block text-[12.5px] font-medium text-ink/80">
          Date paid <span className="text-rose-500">*</span>
          <input type="date" max={today} value={paidAt} onChange={(e) => setPaidAt(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-[12.5px] font-medium text-ink/80">
          Method <span className="text-rose-500">*</span>
          <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className={inputClass}>
            {methods.map((m) => (
              <option key={m} value={m}>
                {m.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-3 block text-[12.5px] font-medium text-ink/80">
        Reference (optional)
        <input value={reference} onChange={(e) => setReference(e.target.value)} className={inputClass} placeholder="TRX-889231" />
      </label>

      <label className="mt-3 block text-[12.5px] font-medium text-ink/80">
        Notes (optional)
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={inputClass + ' resize-none'}
          placeholder="Partial payment for October rent"
        />
      </label>

      <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
        <button type="button" onClick={onClose} className="rounded-full px-4 py-2.5 text-[13px] font-medium text-ink/70 hover:bg-page/70">
          Cancel
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={submit}
          className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white hover:bg-ink/90 disabled:opacity-60"
        >
          {submitting ? 'Recording…' : 'Record payment'}
        </button>
      </div>
    </Modal>
  )
}

function WaiveModal({
  open,
  onClose,
  charge,
  onChanged,
}: {
  open: boolean
  onClose: () => void
  charge: RentCharge
  onChanged: () => void
}) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (!reason) return showToast('A reason is required.', 'error')
    setSubmitting(true)
    try {
      await api.post(`/rent-charges/${charge.id}/waive`, { reason })
      showToast('Charge waived.', 'success')
      onChanged()
      onClose()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not reach the server.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Waive charge">
      <p className="text-[12.5px] text-muted">
        This waives the remaining ₦{Number(charge.balance).toLocaleString()} balance. This cannot be undone.
      </p>
      <label className="mt-4 block text-[12.5px] font-medium text-ink/80">
        Reason <span className="text-rose-500">*</span>
        <input value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} placeholder="Property under repair for the period" />
      </label>
      <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
        <button type="button" onClick={onClose} className="rounded-full px-4 py-2.5 text-[13px] font-medium text-ink/70 hover:bg-page/70">
          Cancel
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={submit}
          className="rounded-full bg-rose-600 px-5 py-2.5 text-[13px] font-medium text-white hover:bg-rose-700 disabled:opacity-60"
        >
          {submitting ? 'Waiving…' : 'Waive'}
        </button>
      </div>
    </Modal>
  )
}

const methodLabel: Record<PaymentMethod, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank transfer',
  pos: 'POS',
  cheque: 'Cheque',
  other: 'Other',
}

function HistoryModal({
  open,
  onClose,
  charge,
}: {
  open: boolean
  onClose: () => void
  charge: RentCharge
}) {
  const { data, loading, error } = usePayments(open ? { rent_charge_id: charge.id, per_page: 50 } : {})
  const payments = data?.data ?? []

  return (
    <Modal open={open} onClose={onClose} title="Payment history">
      <p className="text-[12.5px] text-muted">
        {charge.period_start} → {charge.period_end} · ₦{Number(charge.amount_due).toLocaleString()} due
      </p>

      {loading && (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-page" />
          ))}
        </div>
      )}

      {error && <p className="mt-4 text-center text-[13px] text-muted">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 space-y-2">
          {payments.length === 0 && <p className="py-6 text-center text-[13px] text-muted">No payments recorded yet.</p>}
          {payments.map((p) => (
            <div key={p.id} className="rounded-2xl border border-line bg-white p-3">
              <div className="flex items-center justify-between">
                <p className="text-[13.5px] font-semibold text-ink">₦{Number(p.amount).toLocaleString()}</p>
                <span className="text-[11.5px] capitalize text-ink/60">{methodLabel[p.method]}</span>
              </div>
              <p className="mt-0.5 text-[12px] text-muted">
                Paid {p.paid_at}
                {p.reference ? ` · ${p.reference}` : ''}
              </p>
              {p.notes && <p className="mt-1.5 text-[12.5px] text-ink/70">{p.notes}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex justify-end border-t border-line pt-4">
        <button type="button" onClick={onClose} className="rounded-full px-4 py-2.5 text-[13px] font-medium text-ink/70 hover:bg-page/70">
          Close
        </button>
      </div>
    </Modal>
  )
}
