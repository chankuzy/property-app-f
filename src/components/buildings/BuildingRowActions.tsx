// src/components/buildings/BuildingRowActions.tsx
import { useState, type ReactNode } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import Modal from '../ui/Modal'
import { api, ApiError } from '../../lib/api'
import { showToast } from '../../lib/toast'
import type { Building } from '../../types'

type ModalKind = null | 'edit' | 'delete'

export default function BuildingRowActions({
  building,
  onChanged,
  onDeleted,
}: {
  building: Building
  onChanged: () => void
  onDeleted?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState<ModalKind>(null)

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
          <div className="animate-scale-in absolute right-0 top-9 z-20 w-40 origin-top-right rounded-2xl border border-line bg-white p-1.5 shadow-[0_12px_28px_rgba(20,18,45,0.12)]">
            <MenuItem icon={Pencil} label="Edit" onClick={() => { setModal('edit'); setOpen(false) }} />
            <MenuItem icon={Trash2} label="Delete" tone="danger" onClick={() => { setModal('delete'); setOpen(false) }} />
          </div>
        </>
      )}

      <EditModal open={modal === 'edit'} onClose={() => setModal(null)} building={building} onChanged={onChanged} />
      <DeleteModal open={modal === 'delete'} onClose={() => setModal(null)} building={building} onDeleted={onDeleted ?? onChanged} />
    </div>
  )
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  tone = 'default',
}: {
  icon: typeof Pencil
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

interface EditFormState {
  name: string
  code: string
  floors_count: string
}

function EditModal({
  open,
  onClose,
  building,
  onChanged,
}: {
  open: boolean
  onClose: () => void
  building: Building
  onChanged: () => void
}) {
  const [form, setForm] = useState<EditFormState>(() => ({
    name: building.name,
    code: building.code ?? '',
    floors_count: building.floors_count?.toString() ?? '',
  }))
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  function update<K extends keyof EditFormState>(key: K, value: EditFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function submit() {
    setSubmitting(true)
    setErrors({})
    try {
      await api.put(`/buildings/${building.id}`, {
        name: form.name,
        code: form.code || null,
        floors_count: form.floors_count ? Number(form.floors_count) : null,
      })
      showToast(`${form.name} was updated.`, 'success')
      onChanged()
      onClose()
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(err.errors)
      } else {
        showToast(err instanceof ApiError ? err.message : 'Could not reach the server.', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit building">
      {building.property?.name && (
        <p className="mb-3 text-[12.5px] text-muted">
          Property: <span className="font-medium text-ink/80">{building.property.name}</span> (can't be changed here)
        </p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Name" required error={errors.name}>
          <input required value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Code" error={errors.code}>
          <input value={form.code} onChange={(e) => update('code', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Floors" error={errors.floors_count}>
          <input
            type="number"
            min={1}
            max={500}
            value={form.floors_count}
            onChange={(e) => update('floors_count', e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

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
          {submitting ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </Modal>
  )
}

function DeleteModal({
  open,
  onClose,
  building,
  onDeleted,
}: {
  open: boolean
  onClose: () => void
  building: Building
  onDeleted: () => void
}) {
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    setSubmitting(true)
    try {
      await api.del(`/buildings/${building.id}`)
      showToast(`${building.name} was deleted.`, 'success')
      onDeleted()
      onClose()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not reach the server.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Delete building">
      <p className="text-[12.5px] text-muted">
        This permanently deletes <span className="font-medium text-ink">{building.name}</span>
        {building.units_count ? ` and its ${building.units_count} unit(s)` : ''}. This cannot be undone.
      </p>
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
          {submitting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Modal>
  )
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string[]
  children: ReactNode
}) {
  return (
    <label className="block text-[12.5px] font-medium text-ink/80">
      {label}
      {required && <span className="text-rose-500"> *</span>}
      {children}
      {error && <p className="mt-1 text-[11.5px] text-rose-600">{error[0]}</p>}
    </label>
  )
}
