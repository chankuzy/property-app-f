import { useEffect, useState } from 'react'
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronDown,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
} from 'lucide-react'
import { useUsers } from '../hooks/useUsers'
import { useRoles } from '../hooks/useRoles'
import { useRoute } from '../lib/router'
import { avatarUrl } from '../lib/avatar'
import UserRowActions from '../components/users/UserRowActions'

const PER_PAGE = 10
type StatusFilter = 'all' | 'active' | 'inactive'

export default function UsersPage() {
  const { navigate } = useRoute()

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [roleId, setRoleId] = useState<number | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [statusFilterOpen, setStatusFilterOpen] = useState(false)
  const [roleFilterOpen, setRoleFilterOpen] = useState(false)

  const { data: roles } = useRoles()

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [search, status, roleId])

  const { data, loading, error, refetch } = useUsers({
    per_page: PER_PAGE,
    page,
    search: search || undefined,
    is_active: status === 'all' ? undefined : status === 'active',
    role_id: roleId,
  })

  const users = data?.data ?? []
  const lastPage = data?.meta.last_page ?? 1
  const activeRoleName = roles?.find((r) => r.id === roleId)?.label

  const activeCount = users.filter((u) => u.is_active).length
  const inactiveCount = users.filter((u) => !u.is_active).length
  const roleCount = new Set(users.map((u) => u.role?.id).filter(Boolean)).size

  return (
    <div className="animate-fade-up space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet">
            Administration
          </p>
          <h1 className="text-[24px] font-bold tracking-tight text-ink">
            Staff users
          </h1>
          <p className="mt-1 max-w-xl text-[13px] leading-5 text-muted">
            Manage the people who have access to your property workspace and what they can do.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/users/new')}
          className="flex w-fit items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-[13px] font-medium text-white shadow-sm transition-all hover:bg-ink/90 active:scale-[0.98]"
        >
          <Plus size={14} strokeWidth={2.2} />
          Add user
        </button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Users size={16} strokeWidth={1.8} />}
          label="Total users"
          value={data ? data.meta.total : '—'}
        />

        <StatCard
          icon={<UserCheck size={16} strokeWidth={1.8} />}
          label="Active on page"
          value={loading ? '—' : activeCount}
          tone="good"
        />

        <StatCard
          icon={<UserX size={16} strokeWidth={1.8} />}
          label="Inactive on page"
          value={loading ? '—' : inactiveCount}
          tone={inactiveCount > 0 ? 'warn' : 'default'}
        />

        <StatCard
          icon={<ShieldCheck size={16} strokeWidth={1.8} />}
          label="Roles represented"
          value={loading ? '—' : roleCount}
        />
      </div>

      {/* Directory */}
      <section className="overflow-hidden rounded-3xl border border-line bg-panel shadow-sm">
        <div className="border-b border-line px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">
                Team directory
              </h2>
              <p className="mt-0.5 text-[12px] text-muted">
                Search and filter staff accounts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="flex h-9 items-center gap-2 rounded-xl border border-line bg-white px-3 text-muted shadow-sm">
                <Search size={14} strokeWidth={1.9} />

                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search staff"
                  className="w-40 bg-transparent text-[12.5px] text-ink placeholder:text-muted focus:outline-none sm:w-52"
                />
              </div>

              {/* Role filter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setRoleFilterOpen((v) => !v)
                    setStatusFilterOpen(false)
                  }}
                  className={[
                    'flex h-9 items-center gap-1.5 rounded-xl border bg-white px-3 text-[12.5px] font-medium shadow-sm transition-colors',
                    roleId
                      ? 'border-violet-soft text-ink'
                      : 'border-line text-ink/70 hover:bg-page/60',
                  ].join(' ')}
                >
                  {activeRoleName ?? 'All roles'}
                  <ChevronDown size={13} strokeWidth={2} />
                </button>

                {roleFilterOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setRoleFilterOpen(false)}
                    />

                    <div className="animate-scale-in no-scrollbar absolute right-0 top-11 z-20 max-h-72 w-56 origin-top-right overflow-y-auto rounded-2xl border border-line bg-white p-1.5 shadow-[0_12px_28px_rgba(20,18,45,0.12)]">
                      <button
                        type="button"
                        onClick={() => {
                          setRoleId(undefined)
                          setRoleFilterOpen(false)
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-[12.5px] text-ink/80 transition-colors hover:bg-page/70"
                      >
                        All roles
                        {roleId === undefined && (
                          <Check size={13} strokeWidth={2.2} className="text-violet" />
                        )}
                      </button>

                      {(roles ?? []).map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setRoleId(r.id)
                            setRoleFilterOpen(false)
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-[12.5px] text-ink/80 transition-colors hover:bg-page/70"
                        >
                          <span className="truncate">{r.label}</span>

                          {roleId === r.id && (
                            <Check
                              size={13}
                              strokeWidth={2.2}
                              className="shrink-0 text-violet"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Status filter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilterOpen((v) => !v)
                    setRoleFilterOpen(false)
                  }}
                  className={[
                    'flex h-9 items-center gap-1.5 rounded-xl border bg-white px-3 text-[12.5px] font-medium shadow-sm transition-colors',
                    status !== 'all'
                      ? 'border-violet-soft text-ink'
                      : 'border-line text-ink/70 hover:bg-page/60',
                  ].join(' ')}
                >
                  {status === 'all'
                    ? 'Any status'
                    : status === 'active'
                      ? 'Active'
                      : 'Inactive'}

                  <ChevronDown size={13} strokeWidth={2} />
                </button>

                {statusFilterOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setStatusFilterOpen(false)}
                    />

                    <div className="animate-scale-in absolute right-0 top-11 z-20 w-36 origin-top-right rounded-2xl border border-line bg-white p-1.5 shadow-[0_12px_28px_rgba(20,18,45,0.12)]">
                      {(['all', 'active', 'inactive'] as StatusFilter[]).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setStatus(opt)
                            setStatusFilterOpen(false)
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-[12.5px] capitalize text-ink/80 transition-colors hover:bg-page/70"
                        >
                          {opt}

                          {status === opt && (
                            <Check
                              size={13}
                              strokeWidth={2.2}
                              className="text-violet"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="space-y-2 p-4 sm:p-5">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-[61px] animate-pulse rounded-xl bg-page"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="px-5 py-14 text-center">
            <p className="text-[13px] text-muted">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="no-scrollbar overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line/80 bg-page/30 text-[11.5px] font-semibold uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 font-medium">Team member</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="w-12 px-5 py-3"></th>
                  </tr>
                </thead>

                <tbody>
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-16 text-center">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-page text-muted">
                          <Users size={18} strokeWidth={1.7} />
                        </div>

                        <p className="mt-3 text-[13px] font-medium text-ink">
                          {search || status !== 'all' || roleId
                            ? 'No staff match'
                            : 'No staff yet'}
                        </p>

                        <p className="mt-1 text-[12px] text-muted">
                          {search || status !== 'all' || roleId
                            ? 'Try changing your search or filters.'
                            : 'Add your first staff user to get started.'}
                        </p>
                      </td>
                    </tr>
                  )}

                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-line/70 text-[13px] transition-colors last:border-0 hover:bg-page/30"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={avatarUrl(u.email, 64)}
                              alt=""
                              className="h-9 w-9 rounded-full bg-page object-cover"
                            />

                            <span
                              className={[
                                'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white',
                                u.is_active ? 'bg-good-text' : 'bg-muted/40',
                              ].join(' ')}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink">
                              {u.name}
                            </p>
                            <p className="truncate text-[11.5px] text-muted">
                              Staff account
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="max-w-[250px]">
                          <p className="truncate text-ink/80">{u.email}</p>
                          <p className="mt-0.5 truncate text-[11.5px] text-muted">
                            {u.phone ?? 'No phone number'}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-lg bg-violet-pale px-2.5 py-1 text-[11.5px] font-medium text-violet">
                          {u.role?.label ?? 'No role'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={[
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium',
                            u.is_active
                              ? 'bg-good-bg text-good-text'
                              : 'bg-warn-bg text-warn-text',
                          ].join(' ')}
                        >
                          <span
                            className={[
                              'h-1.5 w-1.5 rounded-full',
                              u.is_active ? 'bg-good-text' : 'bg-warn-text',
                            ].join(' ')}
                          />
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <UserRowActions user={u} onChanged={refetch} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && data.meta.total > 0 && (
              <div className="flex items-center justify-between border-t border-line px-4 py-4 sm:px-5">
                <p className="text-[12px] text-muted">
                  Page {data.meta.current_page} of {lastPage}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-line text-ink/65 transition-colors hover:bg-page/60 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <ChevronLeft size={15} strokeWidth={2} />
                  </button>

                  <button
                    type="button"
                    disabled={page >= lastPage}
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-line text-ink/65 transition-colors hover:bg-page/60 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <ChevronRight size={15} strokeWidth={2} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  tone?: 'default' | 'good' | 'warn'
}) {
  const iconClass =
    tone === 'good'
      ? 'bg-good-bg text-good-text'
      : tone === 'warn'
        ? 'bg-warn-bg text-warn-text'
        : 'bg-page text-muted'

  return (
    <div className="rounded-2xl border border-line bg-panel p-4 shadow-sm">
      <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconClass}`}>
        {icon}
      </div>

      <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-muted">
        {label}
      </p>

      <p className="mt-1 text-[22px] font-semibold tracking-tight text-ink">
        {value}
      </p>
    </div>
  )
}