import { useState, type FormEvent, type ReactNode } from 'react'
import { ArrowLeft, KeyRound, ShieldCheck, UserPlus } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { showToast } from '../lib/toast'
import { useRoute } from '../lib/router'
import { useRoles } from '../hooks/useRoles'

interface FormState {
  name: string
  email: string
  phone: string
  password: string
  role_id: string
  is_active: boolean
}

const initialState: FormState = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role_id: '',
  is_active: true,
}

export default function AddUserPage() {
  const { navigate } = useRoute()
  const { data: roles, loading: rolesLoading } = useRoles()

  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    setFormError(null)

    const payload: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      password: form.password,
      role_id: Number(form.role_id),
      is_active: form.is_active,
    }

    if (form.phone) payload.phone = form.phone

    try {
      await api.post('/users', payload)
      showToast(`${form.name} was added.`, 'success')
      navigate('/users')
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(err.errors)
      } else {
        const message =
          err instanceof ApiError
            ? err.message
            : 'Could not reach the server.'

        setFormError(message)
        showToast(message, 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigate('/users')}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-ink/65 shadow-sm transition-all hover:bg-page/70 hover:text-ink"
          aria-label="Back to users"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
        </button>

        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet">
            Administration
          </p>

          <h1 className="text-[24px] font-bold tracking-tight text-ink">
            Add staff user
          </h1>

          <p className="mt-1 text-[13px] text-muted">
            Create an account and assign the access role for this workspace.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Main form */}
          <section className="rounded-3xl border border-line bg-panel p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-line pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-pale text-violet">
                <UserPlus size={16} strokeWidth={1.8} />
              </div>

              <div>
                <h2 className="text-[14px] font-semibold text-ink">
                  Account details
                </h2>
                <p className="text-[11.5px] text-muted">
                  Basic information for the new team member.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" required error={errors.name}>
                <input
                  required
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className={inputClass}
                  placeholder="Ibrahim Khalifa"
                />
              </Field>

              <Field label="Email" required error={errors.email}>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className={inputClass}
                  placeholder="staff@propertyapp.test"
                />
              </Field>

              <Field label="Phone" error={errors.phone}>
                <input
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className={inputClass}
                  placeholder="+234..."
                />
              </Field>

              <Field label="Password" required error={errors.password}>
                <input
                  type="password"
                  required
                  minLength={10}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className={inputClass}
                  placeholder="Create a strong password"
                />

                <p className="mt-1 text-[11px] font-normal text-muted">
                  At least 10 characters, mixed case, and a number.
                </p>
              </Field>

              <Field label="Role" required error={errors.role_id}>
                <select
                  required
                  value={form.role_id}
                  onChange={(e) => update('role_id', e.target.value)}
                  className={inputClass}
                  disabled={rolesLoading}
                >
                  <option value="" disabled>
                    {rolesLoading ? 'Loading roles…' : 'Select a role'}
                  </option>

                  {(roles ?? []).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Account status">
                <select
                  value={form.is_active ? 'active' : 'inactive'}
                  onChange={(e) =>
                    update('is_active', e.target.value === 'active')
                  }
                  className={inputClass}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>
            </div>

            {formError && (
              <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-3 text-[12px] text-rose-600">
                {formError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => navigate('/users')}
                disabled={submitting}
                className="rounded-xl px-4 py-2.5 text-[13px] font-medium text-ink/65 transition-colors hover:bg-page/70 hover:text-ink disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || rolesLoading}
                className="flex items-center gap-1.5 rounded-xl bg-ink px-5 py-2.5 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-ink/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
              >
                <UserPlus size={14} strokeWidth={1.9} />
                {submitting ? 'Creating…' : 'Create user'}
              </button>
            </div>
          </section>

          {/* Side information */}
          <aside className="space-y-3">
            <InfoCard
              icon={<ShieldCheck size={16} strokeWidth={1.8} />}
              title="Role-based access"
              text="The selected role determines which parts of the property workspace this user can access."
            />

            <InfoCard
              icon={<KeyRound size={16} strokeWidth={1.8} />}
              title="Account security"
              text="Use a strong password and keep staff accounts personal rather than sharing login credentials."
            />
          </aside>
        </div>
      </form>
    </div>
  )
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13px] text-ink shadow-sm transition focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet-soft'

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

      {error && (
        <p className="mt-1 text-[11.5px] font-normal text-rose-600">
          {error[0]}
        </p>
      )}
    </label>
  )
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: ReactNode
  title: string
  text: string
}) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-4 shadow-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-page text-muted">
        {icon}
      </div>

      <h3 className="mt-3 text-[13px] font-semibold text-ink">{title}</h3>

      <p className="mt-1 text-[11.5px] leading-5 text-muted">{text}</p>
    </div>
  )
}