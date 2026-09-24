// src/components/tenancies/TenancyRowActions.tsx
import { useState } from 'react'
import { MoreVertical, RefreshCw, ArrowLeftRight, XCircle } from 'lucide-react'
import Modal from '../ui/Modal'
import { api, ApiError } from '../../lib/api'
import { showToast } from '../../lib/toast'
import { useAllUnits } from '../../hooks/useUnits'
import type { BillingCycle, TenancySummary } from '../../types'

type ModalKind = null | 'renew' | 'transfer' | 'terminate'

export default function TenancyRowActions({ tenancy, onChanged }: { tenancy: TenancySummary; onChanged: () => void }) {
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState<ModalKind>(null)

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        aria-label={`Actions for tenancy ${tenancy.id}`}
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex h-8 w-8 items-center justify-center rounded-full border transition-all",
          open
            ? "border-violet-soft bg-violet-pale text-violet"
            : "border-transparent text-muted hover:border-line hover:bg-page/70 hover:text-ink",
        ].join(" ")}
      >
        <MoreVertical size={15} strokeWidth={1.8} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="animate-scale-in absolute right-0 top-9 z-20 w-40 origin-top-right rounded-2xl border border-line bg-white p-1.5 shadow-[0_12px_28px_rgba(20,18,45,0.12)]">
            <MenuItem
              icon={RefreshCw}
              label="Renew"
              onClick={() => {
                setModal("renew");
                setOpen(false);
              }}
            />
            <MenuItem
              icon={ArrowLeftRight}
              label="Transfer"
              onClick={() => {
                setModal("transfer");
                setOpen(false);
              }}
            />
            <MenuItem
              icon={XCircle}
              label="Terminate"
              tone="danger"
              onClick={() => {
                setModal("terminate");
                setOpen(false);
              }}
            />
          </div>
        </>
      )}

      <RenewModal
        open={modal === "renew"}
        onClose={() => setModal(null)}
        tenancy={tenancy}
        onChanged={onChanged}
      />
      <TransferModal
        open={modal === "transfer"}
        onClose={() => setModal(null)}
        tenancy={tenancy}
        onChanged={onChanged}
      />
      <TerminateModal
        open={modal === "terminate"}
        onClose={() => setModal(null)}
        tenancy={tenancy}
        onChanged={onChanged}
      />
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  tone = 'default',
}: {
  icon: typeof RefreshCw
  label: string
  onClick: () => void
  tone?: 'default' | 'danger'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[12.5px] transition-colors hover:bg-page/70',
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

const billingCycles: BillingCycle[] = ['monthly', 'quarterly', 'biannual', 'annual']

function RenewModal({
  open,
  onClose,
  tenancy,
  onChanged,
}: {
  open: boolean
  onClose: () => void
  tenancy: TenancySummary
  onChanged: () => void
}) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [billingCycle, setBillingCycle] = useState<'' | BillingCycle>('')
  const [rentAmount, setRentAmount] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function reset() {
    setStartDate('')
    setEndDate('')
    setBillingCycle('')
    setRentAmount('')
    setDepositAmount('')
  }

  async function submit() {
    if (!endDate) return showToast('End date is required.', 'error')
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = { end_date: endDate }
      if (startDate) payload.start_date = startDate
      if (billingCycle) payload.billing_cycle = billingCycle
      if (rentAmount) payload.rent_amount = Number(rentAmount)
      if (depositAmount) payload.deposit_amount = Number(depositAmount)
      await api.post(`/tenancies/${tenancy.id}/renew`, payload)
      showToast('Tenancy renewed.', 'success')
      onChanged()
      reset()
      onClose()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not reach the server.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={() => { reset(); onClose() }} title="Renew tenancy">
      <p className="text-[12.5px] text-muted">
        Current term: {tenancy.start_date} → {tenancy.end_date} · {tenancy.billing_cycle} · ₦{Number(tenancy.rent_amount).toLocaleString()}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-[12.5px] font-medium text-ink/80">
          New start date (optional)
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
          <p className="mt-1 text-[11px] text-muted">Defaults to the current end date.</p>
        </label>
        <label className="block text-[12.5px] font-medium text-ink/80">
          New end date <span className="text-rose-500">*</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-[12.5px] font-medium text-ink/80">
          Billing cycle (optional)
          <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as '' | BillingCycle)} className={inputClass}>
            <option value="">Keep {tenancy.billing_cycle}</option>
            {billingCycles.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[12.5px] font-medium text-ink/80">
          New rent amount (₦, optional)
          <input
            type="number"
            min={0}
            value={rentAmount}
            onChange={(e) => setRentAmount(e.target.value)}
            className={inputClass}
            placeholder={tenancy.rent_amount}
          />
        </label>
        <label className="block text-[12.5px] font-medium text-ink/80 sm:col-span-2">
          New deposit amount (₦, optional)
          <input
            type="number"
            min={0}
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
        <button type="button" onClick={() => { reset(); onClose() }} className="rounded-full px-4 py-2.5 text-[13px] font-medium text-ink/70 hover:bg-page/70">
          Cancel
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={submit}
          className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white hover:bg-ink/90 disabled:opacity-60"
        >
          {submitting ? 'Renewing…' : 'Renew'}
        </button>
      </div>
    </Modal>
  )
}

function TransferModal({
  open,
  onClose,
  tenancy,
  onChanged,
}: {
  open: boolean
  onClose: () => void
  tenancy: TenancySummary
  onChanged: () => void
}) {
  const { data: unitsData } = useAllUnits()
  const units = (unitsData?.data ?? []).filter((u) => u.id !== tenancy.unit_id)
  const [unitId, setUnitId] = useState('')
  const [transferDate, setTransferDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [billingCycle, setBillingCycle] = useState<'' | BillingCycle>('')
  const [rentAmount, setRentAmount] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function reset() {
    setUnitId('')
    setTransferDate('')
    setEndDate('')
    setBillingCycle('')
    setRentAmount('')
    setDepositAmount('')
    setReason('')
  }

  async function submit() {
    if (!unitId) return showToast('Select a destination unit.', 'error')
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = { unit_id: Number(unitId) }
      if (transferDate) payload.transfer_date = transferDate
      if (endDate) payload.end_date = endDate
      if (billingCycle) payload.billing_cycle = billingCycle
      if (rentAmount) payload.rent_amount = Number(rentAmount)
      if (depositAmount) payload.deposit_amount = Number(depositAmount)
      if (reason) payload.reason = reason
      await api.post(`/tenancies/${tenancy.id}/transfer`, payload)
      showToast('Tenant transferred.', 'success')
      onChanged()
      reset()
      onClose()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not reach the server.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={() => { reset(); onClose() }} title="Transfer tenant">
      <label className="block text-[12.5px] font-medium text-ink/80">
        New unit <span className="text-rose-500">*</span>
        <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className={inputClass}>
          <option value="" disabled>
            Select a unit
          </option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.code} — {u.property?.name ?? 'Unassigned'}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-[12.5px] font-medium text-ink/80">
          Transfer date (optional)
          <input type="date" value={transferDate} onChange={(e) => setTransferDate(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-[12.5px] font-medium text-ink/80">
          New end date (optional)
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-[12.5px] font-medium text-ink/80">
          Billing cycle (optional)
          <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as '' | BillingCycle)} className={inputClass}>
            <option value="">Keep {tenancy.billing_cycle}</option>
            {billingCycles.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[12.5px] font-medium text-ink/80">
          New rent amount (₦, optional)
          <input
            type="number"
            min={0}
            value={rentAmount}
            onChange={(e) => setRentAmount(e.target.value)}
            className={inputClass}
            placeholder={tenancy.rent_amount}
          />
        </label>
        <label className="block text-[12.5px] font-medium text-ink/80 sm:col-span-2">
          New deposit amount (₦, optional)
          <input
            type="number"
            min={0}
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="mt-3 block text-[12.5px] font-medium text-ink/80">
        Reason (optional)
        <input value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} placeholder="Tenant requested a smaller unit" />
      </label>

      <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
        <button type="button" onClick={() => { reset(); onClose() }} className="rounded-full px-4 py-2.5 text-[13px] font-medium text-ink/70 hover:bg-page/70">
          Cancel
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={submit}
          className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white hover:bg-ink/90 disabled:opacity-60"
        >
          {submitting ? 'Transferring…' : 'Transfer'}
        </button>
      </div>
    </Modal>
  )
}

function TerminateModal({
  open,
  onClose,
  tenancy,
  onChanged,
}: {
  open: boolean
  onClose: () => void
  tenancy: TenancySummary
  onChanged: () => void
}) {
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (!reason) return showToast('A reason is required.', 'error')
    setSubmitting(true)
    try {
      await api.post(`/tenancies/${tenancy.id}/terminate`, { reason })
      showToast('Tenancy terminated.', 'success')
      onChanged()
      onClose()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not reach the server.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Terminate tenancy">
      <p className="text-[12.5px] text-muted">This ends the tenancy immediately. This cannot be undone.</p>
      <label className="mt-4 block text-[12.5px] font-medium text-ink/80">
        Reason <span className="text-rose-500">*</span>
        <input value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} placeholder="Tenant relocated to another city" />
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
          {submitting ? 'Terminating…' : 'Terminate'}
        </button>
      </div>
    </Modal>
  )
}
