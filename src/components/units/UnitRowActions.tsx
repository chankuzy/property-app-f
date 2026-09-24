// src/components/units/UnitRowActions.tsx
import { useState, type ReactNode } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import Modal from '../ui/Modal'
import { api, ApiError } from '../../lib/api'
import { showToast } from '../../lib/toast'
import { useBuildings } from '../../hooks/useBuildings'
import type { Unit } from '../../types'

type ModalKind = null | 'edit' | 'delete'

export default function UnitRowActions({
  unit,
  onChanged,
  onDeleted,
}: {
  unit: Unit
  onChanged: () => void
  onDeleted?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState<ModalKind>(null)

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        aria-label={`Actions for ${unit.name ?? unit.code}`}
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
              icon={Pencil}
              label="Edit"
              onClick={() => {
                setModal("edit");
                setOpen(false);
              }}
            />
            <MenuItem
              icon={Trash2}
              label="Delete"
              tone="danger"
              onClick={() => {
                setModal("delete");
                setOpen(false);
              }}
            />
          </div>
        </>
      )}

      <EditModal
        open={modal === "edit"}
        onClose={() => setModal(null)}
        unit={unit}
        onChanged={onChanged}
      />
      <DeleteModal
        open={modal === "delete"}
        onClose={() => setModal(null)}
        unit={unit}
        onDeleted={onDeleted ?? onChanged}
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
  building_id: string
  code: string
  name: string
  type: string
  floor: string
  bedrooms: string
  bathrooms: string
  default_rent: string
  status: '' | 'available' | 'maintenance'
}

function EditModal({
  open,
  onClose,
  unit,
  onChanged,
}: {
  open: boolean
  onClose: () => void
  unit: Unit
  onChanged: () => void
}) {
  const { data: buildingsData, loading: buildingsLoading } = useBuildings({ property_id: unit.property_id, per_page: 100 })
  const buildings = buildingsData?.data ?? []

  const [form, setForm] = useState<EditFormState>(() => ({
    building_id: unit.building_id ? String(unit.building_id) : '',
    code: unit.code,
    name: unit.name ?? '',
    type: unit.type ?? '',
    floor: unit.floor?.toString() ?? '',
    bedrooms: unit.bedrooms?.toString() ?? '',
    bathrooms: unit.bathrooms?.toString() ?? '',
    default_rent: unit.default_rent ?? '',
    status: '',
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
      const payload: Record<string, unknown> = {
        code: form.code,
        building_id: form.building_id ? Number(form.building_id) : null,
        name: form.name || null,
        type: form.type || null,
        floor: form.floor ? Number(form.floor) : null,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        default_rent: form.default_rent ? Number(form.default_rent) : null,
      }
      if (form.status) payload.status = form.status
      await api.put(`/units/${unit.id}`, payload)
      showToast(`Unit ${form.code} was updated.`, 'success')
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
    <Modal open={open} onClose={onClose} title="Edit unit">
      {unit.property?.name && (
        <p className="mb-3 text-[12.5px] text-muted">
          Property: <span className="font-medium text-ink/80">{unit.property.name}</span> (can't be changed here)
        </p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Unit code" required error={errors.code}>
          <input required value={form.code} onChange={(e) => update('code', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Building" error={errors.building_id}>
          <select
            value={form.building_id}
            onChange={(e) => update('building_id', e.target.value)}
            className={inputClass}
            disabled={buildingsLoading}
          >
            <option value="">{buildingsLoading ? 'Loading…' : 'No building'}</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Display name" error={errors.name}>
          <input value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Type" error={errors.type}>
          <input value={form.type} onChange={(e) => update('type', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Floor" error={errors.floor}>
          <input type="number" min={-10} max={500} value={form.floor} onChange={(e) => update('floor', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Bedrooms" error={errors.bedrooms}>
          <input type="number" min={0} max={50} value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Bathrooms" error={errors.bathrooms}>
          <input type="number" min={0} max={50} value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Default rent (₦)" error={errors.default_rent}>
          <input type="number" min={0} value={form.default_rent} onChange={(e) => update('default_rent', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Manual status override" error={errors.status}>
          <select value={form.status} onChange={(e) => update('status', e.target.value as EditFormState['status'])} className={inputClass}>
            <option value="">Leave unchanged ({unit.status})</option>
            <option value="available">Available</option>
            <option value="maintenance">Maintenance</option>
          </select>
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
  unit,
  onDeleted,
}: {
  open: boolean
  onClose: () => void
  unit: Unit
  onDeleted: () => void
}) {
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    setSubmitting(true)
    try {
      await api.del(`/units/${unit.id}`)
      showToast(`Unit ${unit.code} was deleted.`, 'success')
      onDeleted()
      onClose()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not reach the server.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Delete unit">
      <p className="text-[12.5px] text-muted">
        This permanently deletes <span className="font-medium text-ink">{unit.name ?? unit.code}</span>. This cannot be undone.
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
