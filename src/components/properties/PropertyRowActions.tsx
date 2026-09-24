// src/components/properties/PropertyRowActions.tsx
import { useState, type ReactNode } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import Modal from '../ui/Modal'
import { api, ApiError } from '../../lib/api'
import { showToast } from '../../lib/toast'
import type { Property } from '../../types'

type ModalKind = null | 'edit' | 'delete'

export default function PropertyRowActions({
  property,
  onChanged,
  onDeleted,
}: {
  property: Property
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

      <EditModal open={modal === 'edit'} onClose={() => setModal(null)} property={property} onChanged={onChanged} />
      <DeleteModal open={modal === 'delete'} onClose={() => setModal(null)} property={property} onDeleted={onDeleted ?? onChanged} />
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
  type: string
  address: string
  city: string
  state: string
  country: string
  owner_name: string
  owner_phone: string
  is_active: boolean
}

function EditModal({
  open,
  onClose,
  property,
  onChanged,
}: {
  open: boolean
  onClose: () => void
  property: Property
  onChanged: () => void
}) {
  const [form, setForm] = useState<EditFormState>(() => ({
    name: property.name,
    code: property.code ?? '',
    type: property.type ?? '',
    address: property.address ?? '',
    city: property.city ?? '',
    state: property.state ?? '',
    country: property.country ?? '',
    owner_name: property.owner_name ?? '',
    owner_phone: property.owner_phone ?? '',
    is_active: property.is_active,
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
      await api.put(`/properties/${property.id}`, {
        name: form.name,
        code: form.code || null,
        type: form.type || null,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        country: form.country || null,
        owner_name: form.owner_name || null,
        owner_phone: form.owner_phone || null,
        is_active: form.is_active,
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
    <Modal open={open} onClose={onClose} title="Edit property">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Name" required error={errors.name}>
          <input required value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Code" error={errors.code}>
          <input value={form.code} onChange={(e) => update('code', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Type" error={errors.type}>
          <input value={form.type} onChange={(e) => update('type', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Status" error={undefined}>
          <select
            value={form.is_active ? 'active' : 'inactive'}
            onChange={(e) => update('is_active', e.target.value === 'active')}
            className={inputClass}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </Field>
        <Field label="Address" error={errors.address}>
          <input value={form.address} onChange={(e) => update('address', e.target.value)} className={inputClass} />
        </Field>
        <Field label="City" error={errors.city}>
          <input value={form.city} onChange={(e) => update('city', e.target.value)} className={inputClass} />
        </Field>
        <Field label="State" error={errors.state}>
          <input value={form.state} onChange={(e) => update('state', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Country" error={errors.country}>
          <input value={form.country} onChange={(e) => update('country', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Owner name" error={errors.owner_name}>
          <input value={form.owner_name} onChange={(e) => update('owner_name', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Owner phone" error={errors.owner_phone}>
          <input value={form.owner_phone} onChange={(e) => update('owner_phone', e.target.value)} className={inputClass} />
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
  property,
  onDeleted,
}: {
  open: boolean
  onClose: () => void
  property: Property
  onDeleted: () => void
}) {
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    setSubmitting(true)
    try {
      await api.del(`/properties/${property.id}`)
      showToast(`${property.name} was deleted.`, 'success')
      onDeleted()
      onClose()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not reach the server.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Delete property">
      <p className="text-[12.5px] text-muted">
        This permanently deletes <span className="font-medium text-ink">{property.name}</span>
        {property.units_count ? ` and its ${property.units_count} unit(s)` : ''}. This cannot be undone.
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
