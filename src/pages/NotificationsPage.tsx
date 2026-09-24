import { useState } from 'react'
import {
  Bell,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Mail,
  Send,
} from 'lucide-react'
import {
  useNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../hooks/useNotifications'
import { useNotificationLogs } from '../hooks/useNotificationLogs'
import { showToast } from '../lib/toast'
import { ApiError } from '../lib/api'
import SendReminderModal from '../components/notifications/SendReminderModal'

const PER_PAGE = 15
type Tab = 'alerts' | 'logs'

export default function NotificationsPage() {
  const [tab, setTab] = useState<Tab>('alerts')

  return (
    <div className="animate-fade-up space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet">
            Communications
          </p>
          <h1 className="text-[24px] font-bold tracking-tight text-ink">
            Notifications
          </h1>
          <p className="mt-1 max-w-xl text-[13px] leading-5 text-muted">
            Keep track of important alerts and every tenant reminder sent from the platform.
          </p>
        </div>

        <div className="flex w-fit items-center gap-1 rounded-2xl border border-line bg-white p-1 shadow-sm">
          <TabButton active={tab === 'alerts'} onClick={() => setTab('alerts')}>
            <Bell size={14} strokeWidth={1.8} />
            Alerts
          </TabButton>

          <TabButton active={tab === 'logs'} onClick={() => setTab('logs')}>
            <Mail size={14} strokeWidth={1.8} />
            Reminder logs
          </TabButton>
        </div>
      </div>

      {tab === 'alerts' ? <AlertsTab /> : <LogsTab />}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12.5px] font-medium transition-all',
        active
          ? 'bg-ink text-white shadow-sm'
          : 'text-ink/60 hover:bg-page/70 hover:text-ink',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function AlertsTab() {
  const [page, setPage] = useState(1)
  const { data, loading, error, refetch } = useNotifications({
    per_page: PER_PAGE,
    page,
  })

  const items = data?.data ?? []
  const lastPage = data?.meta.last_page ?? 1
  const unreadCount = items.filter((n) => !n.read_at).length
  const [markingAll, setMarkingAll] = useState(false)

  async function handleMarkRead(id: string) {
    try {
      await markNotificationRead(id)
      refetch()
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Could not reach the server.',
        'error',
      )
    }
  }

  async function handleMarkAll() {
    setMarkingAll(true)

    try {
      await markAllNotificationsRead()
      showToast('All notifications marked read.', 'success')
      refetch()
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Could not reach the server.',
        'error',
      )
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <>
      {/* Overview */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={<Bell size={16} strokeWidth={1.8} />}
          label="Total alerts"
          value={data ? data.meta.total : '—'}
        />

        <StatCard
          icon={<CircleAlert size={16} strokeWidth={1.8} />}
          label="Unread on page"
          value={loading ? '—' : unreadCount}
          accent={unreadCount > 0}
        />

        <StatCard
          icon={<CheckCheck size={16} strokeWidth={1.8} />}
          label="Current page"
          value={data ? `${data.meta.current_page} / ${lastPage}` : '—'}
        />
      </div>

      {/* Alert inbox */}
      <section className="overflow-hidden rounded-3xl border border-line bg-panel shadow-sm">
        <div className="flex flex-col gap-3 border-b border-line px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Alert inbox</h2>
            <p className="mt-0.5 text-[12px] text-muted">
              System notifications and important activity.
            </p>
          </div>

          <button
            type="button"
            disabled={markingAll || items.length === 0}
            onClick={handleMarkAll}
            className="flex w-fit items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-[12.5px] font-medium text-ink/75 transition-all hover:bg-page/60 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCheck size={14} strokeWidth={1.8} />
            {markingAll ? 'Marking…' : 'Mark all read'}
          </button>
        </div>

        {loading && (
          <div className="space-y-2 p-4 sm:p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[68px] animate-pulse rounded-2xl bg-page"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-page text-muted">
              <CircleAlert size={17} strokeWidth={1.7} />
            </div>
            <p className="mt-3 text-[13px] text-muted">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="divide-y divide-line/80">
              {items.length === 0 && (
                <div className="px-5 py-16 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-violet-pale text-violet">
                    <Bell size={18} strokeWidth={1.7} />
                  </div>
                  <p className="mt-3 text-[13px] font-medium text-ink">
                    Nothing here yet
                  </p>
                  <p className="mt-1 text-[12px] text-muted">
                    New system alerts will appear here.
                  </p>
                </div>
              )}

              {items.map((n) => (
                <div
                  key={n.id}
                  className={[
                    'group flex items-start gap-3 px-4 py-4 transition-colors sm:px-5',
                    n.read_at
                      ? 'bg-white hover:bg-page/30'
                      : 'bg-violet-pale/25 hover:bg-violet-pale/40',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                      n.read_at
                        ? 'bg-page text-muted'
                        : 'bg-violet-pale text-violet',
                    ].join(' ')}
                  >
                    <Bell size={15} strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {!n.read_at && (
                        <span className="h-1.5 w-1.5 rounded-full bg-violet" />
                      )}

                      <p
                        className={[
                          'text-[13px]',
                          n.read_at
                            ? 'font-medium text-ink/80'
                            : 'font-semibold text-ink',
                        ].join(' ')}
                      >
                        {n.message ?? n.type}
                      </p>
                    </div>

                    <p className="mt-1 text-[11.5px] text-muted">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>

                  {!n.read_at && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      className="shrink-0 rounded-xl border border-line bg-white px-3 py-1.5 text-[11.5px] font-medium text-ink/65 opacity-100 transition-all hover:bg-page hover:text-ink sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>

            {data && data.meta.total > 0 && (
              <Pagination
                page={data.meta.current_page}
                lastPage={lastPage}
                onPrevious={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(lastPage, p + 1))}
              />
            )}
          </>
        )}
      </section>
    </>
  )
}

function LogsTab() {
  const [audience, setAudience] = useState<'all' | 'staff' | 'tenant'>('all')
  const [page, setPage] = useState(1)
  const [reminderOpen, setReminderOpen] = useState(false)

  const { data, loading, error, refetch } = useNotificationLogs({
    per_page: PER_PAGE,
    page,
    audience: audience === 'all' ? undefined : audience,
  })

  const logs = data?.data ?? []
  const lastPage = data?.meta.last_page ?? 1

  const totalLogs = data?.meta.total ?? 0
  const sentCount = logs.filter((l) => l.status === 'sent').length
  const failedCount = logs.filter((l) => l.status === 'failed').length

  return (
    <>
      {/* Log overview */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={<Send size={16} strokeWidth={1.8} />}
          label="Total reminders"
          value={data ? totalLogs : '—'}
        />

        <StatCard
          icon={<CheckCheck size={16} strokeWidth={1.8} />}
          label="Sent on page"
          value={loading ? '—' : sentCount}
        />

        <StatCard
          icon={<CircleAlert size={16} strokeWidth={1.8} />}
          label="Failed on page"
          value={loading ? '—' : failedCount}
          accent={failedCount > 0}
        />
      </div>

      {/* Reminder logs */}
      <section className="overflow-hidden rounded-3xl border border-line bg-panel shadow-sm">
        <div className="border-b border-line px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">
                Reminder activity
              </h2>
              <p className="mt-0.5 text-[12px] text-muted">
                A record of messages sent to tenants and staff.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl border border-line bg-page/40 p-1">
                {(['all', 'staff', 'tenant'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setAudience(opt)
                      setPage(1)
                    }}
                    className={[
                      'rounded-lg px-3 py-1.5 text-[12px] font-medium capitalize transition-all',
                      audience === opt
                        ? 'bg-white text-ink shadow-sm'
                        : 'text-muted hover:text-ink',
                    ].join(' ')}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setReminderOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-[12.5px] font-medium text-white shadow-sm transition-all hover:bg-ink/90 active:scale-[0.98]"
              >
                <Send size={13} strokeWidth={2} />
                Send reminder
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="space-y-2 p-4 sm:p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-xl bg-page"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-page text-muted">
              <CircleAlert size={17} strokeWidth={1.7} />
            </div>
            <p className="mt-3 text-[13px] text-muted">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="no-scrollbar overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line/80 bg-page/30 text-[11.5px] font-semibold uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 font-medium">Recipient</th>
                    <th className="px-4 py-3 font-medium">Audience</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Channel</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Sent</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-page text-muted">
                          <Send size={17} strokeWidth={1.7} />
                        </div>
                        <p className="mt-3 text-[13px] font-medium text-ink">
                          No reminder logs
                        </p>
                        <p className="mt-1 text-[12px] text-muted">
                          Sent reminders will appear here.
                        </p>
                      </td>
                    </tr>
                  )}

                  {logs.map((l) => (
                    <tr
                      key={l.id}
                      className="border-b border-line/70 text-[13px] transition-colors last:border-0 hover:bg-page/30"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-pale text-[11px] font-semibold text-violet">
                            {getInitials(l.tenant?.full_name ?? 'Unknown')}
                          </div>

                          <span className="font-medium text-ink">
                            {l.tenant?.full_name ?? '—'}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="rounded-lg bg-page px-2.5 py-1 text-[11px] font-medium capitalize text-ink/70">
                          {l.audience}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-ink/75">{l.type}</td>

                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[11px] uppercase tracking-wide text-ink/55">
                          {l.channel}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusPill status={l.status} />
                      </td>

                      <td className="px-5 py-3.5 text-[12px] text-muted">
                        {new Date(l.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && data.meta.total > 0 && (
              <Pagination
                page={data.meta.current_page}
                lastPage={lastPage}
                onPrevious={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(lastPage, p + 1))}
              />
            )}
          </>
        )}

        <SendReminderModal
          open={reminderOpen}
          onClose={() => setReminderOpen(false)}
          onSent={refetch}
        />
      </section>
    </>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div
          className={[
            'flex h-8 w-8 items-center justify-center rounded-xl',
            accent
              ? 'bg-violet-pale text-violet'
              : 'bg-page text-muted',
          ].join(' ')}
        >
          {icon}
        </div>

        {accent && (
          <span className="h-1.5 w-1.5 rounded-full bg-violet" />
        )}
      </div>

      <p className="mt-4 text-[11.5px] font-medium uppercase tracking-wide text-muted">
        {label}
      </p>

      <p className="mt-1 text-[22px] font-semibold tracking-tight text-ink">
        {value}
      </p>
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase()

  const tone =
    normalized === 'sent' || normalized === 'delivered'
      ? 'bg-good-bg text-good-text'
      : normalized === 'failed' || normalized === 'error'
        ? 'bg-rose-50 text-rose-600'
        : normalized === 'pending'
          ? 'bg-warn-bg text-warn-text'
          : 'bg-page text-ink/65'

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium capitalize',
        tone,
      ].join(' ')}
    >
      {status}
    </span>
  )
}

function Pagination({
  page,
  lastPage,
  onPrevious,
  onNext,
}: {
  page: number
  lastPage: number
  onPrevious: () => void
  onNext: () => void
}) {
  return (
    <div className="flex items-center justify-between border-t border-line px-4 py-4 sm:px-5">
      <p className="text-[12px] text-muted">
        Page {page} of {lastPage}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={onPrevious}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-line text-ink/65 transition-colors hover:bg-page/60 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Previous page"
        >
          <ChevronLeft size={15} strokeWidth={2} />
        </button>

        <button
          type="button"
          disabled={page >= lastPage}
          onClick={onNext}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-line text-ink/65 transition-colors hover:bg-page/60 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Next page"
        >
          <ChevronRight size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}