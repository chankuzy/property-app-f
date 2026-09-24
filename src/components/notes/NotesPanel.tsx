// src/components/notes/NotesPanel.tsx
import { useState, type FormEvent } from 'react'
import { StickyNote, Send } from 'lucide-react'
import { useNotes, createNote } from '../../hooks/useNotes'
import { showToast } from '../../lib/toast'
import { ApiError } from '../../lib/api'
import type { NotableType } from '../../types'

/**
 * Drop this into any record's detail view once one exists, e.g.:
 *   <NotesPanel notableType="tenant" notableId={tenant.id} />
 * Nothing in the current tree renders detail pages for properties/units/
 * tenants/tenancies yet — this is the standalone piece that's ready for
 * whichever detail view gets built first.
 */
export default function NotesPanel({ notableType, notableId }: { notableType: NotableType; notableId: number }) {
  const { data, loading, error, refetch } = useNotes(notableType, notableId)
  const notes = data?.data ?? []

  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    try {
      await createNote(notableType, notableId, body.trim())
      setBody('')
      refetch()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not reach the server.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-3xl border border-line bg-panel p-4 sm:p-5">
      <h2 className="text-[15px] font-semibold text-ink">Notes</h2>

      <form onSubmit={handleSubmit} className="mt-3 flex items-start gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          maxLength={5000}
          placeholder="Called tenant to confirm rent payment plan."
          className="flex-1 resize-none rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-violet-soft"
        />
        <button
          type="submit"
          disabled={submitting || !body.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-ink/90 disabled:opacity-50"
        >
          <Send size={15} strokeWidth={1.8} />
        </button>
      </form>

      {loading && (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-page" />
          ))}
        </div>
      )}

      {error && <p className="mt-4 text-center text-[13px] text-muted">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 space-y-2.5">
          {notes.length === 0 && <p className="py-6 text-center text-[13px] text-muted">No notes yet.</p>}
          {notes.map((n) => (
            <div key={n.id} className="flex gap-2.5 rounded-2xl border border-line bg-white p-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-pale text-violet">
                <StickyNote size={13} strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <p className="whitespace-pre-wrap text-[13px] text-ink/90">{n.body}</p>
                <p className="mt-1 text-[11px] text-muted">
                  {n.user?.name ?? 'Unknown'} · {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
