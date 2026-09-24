// src/components/auth/ChangePasswordModal.tsx
import { useState } from 'react'
import Modal from '../ui/Modal'
import { api, ApiError } from '../../lib/api'
import { showToast } from '../../lib/toast'

const inputClass =
  'mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-violet-soft'

export default function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword

  function reset() {
    setCurrentPassword('')
    setPassword('')
    setConfirmPassword('')
    setErrors({})
  }

  async function submit() {
    setErrors({})
    if (password !== confirmPassword) {
      setErrors({ password_confirmation: ['New password and confirmation do not match.'] })
      return
    }
    setSubmitting(true)
    try {
      // Laravel's `confirmed` rule on `password` requires a sibling
      // `password_confirmation` field in the payload — without it the
      // rule fails even when the two fields actually match.
      await api.put('/auth/password', {
        current_password: currentPassword,
        password,
        password_confirmation: confirmPassword,
      })
      showToast('Password updated.', 'success')
      reset()
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
    <Modal
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      title="Change password"
    >
      <label className="block text-[12.5px] font-medium text-ink/80">
        Current password <span className="text-rose-500">*</span>
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className={inputClass}
        />
        {errors.current_password && <p className="mt-1 text-[11.5px] text-rose-600">{errors.current_password[0]}</p>}
      </label>

      <label className="mt-3 block text-[12.5px] font-medium text-ink/80">
        New password <span className="text-rose-500">*</span>
        <input
          type="password"
          required
          minLength={10}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        {errors.password && <p className="mt-1 text-[11.5px] text-rose-600">{errors.password[0]}</p>}
      </label>
      <p className="mt-1 text-[11px] text-muted">At least 10 characters, mixed case, one number, and different from your current password.</p>

      <label className="mt-3 block text-[12.5px] font-medium text-ink/80">
        Confirm new password <span className="text-rose-500">*</span>
        <input
          type="password"
          required
          minLength={10}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputClass}
        />
        {mismatch && <p className="mt-1 text-[11.5px] text-rose-600">Passwords do not match.</p>}
        {errors.password_confirmation && <p className="mt-1 text-[11.5px] text-rose-600">{errors.password_confirmation[0]}</p>}
      </label>

      <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
        <button
          type="button"
          onClick={() => {
            reset()
            onClose()
          }}
          className="rounded-full px-4 py-2.5 text-[13px] font-medium text-ink/70 hover:bg-page/70"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={submitting || !currentPassword || !password || !confirmPassword || mismatch}
          onClick={submit}
          className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-white hover:bg-ink/90 disabled:opacity-60"
        >
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </Modal>
  )
}
