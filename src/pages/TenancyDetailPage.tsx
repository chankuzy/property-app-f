// src/pages/TenantDetailPage.tsx
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Clock3,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldAlert,
  UserRound,
} from 'lucide-react'
import { useRoute } from '../lib/router'
import { useTenantDetail } from '../hooks/useTenants'
import { useTenantHistory } from '../hooks/useTenancies'
import { avatarUrl } from '../lib/avatar'
import StatusPill from '../components/contacts/StatusPill'
import LifecyclePill from '../components/contacts/LifecyclePill'
import NotesPanel from '../components/notes/NotesPanel'

export default function TenantDetailPage({ id }: { id: number }) {
  const { navigate } = useRoute()
  const { data: tenant, loading, error } = useTenantDetail(id)
  const { data: historyData, loading: historyLoading } =
    useTenantHistory(id)

  const history = historyData?.data ?? []
  const activeTenancies = tenant?.active_tenancies ?? []

  return (
    <div className="animate-fade-up">
      {/* Navigation */}
      <div className="mb-5">
        <button
          type="button"
          onClick={() => navigate('/tenants')}
          className="group flex items-center gap-2 rounded-full px-1.5 py-1.5 text-[12.5px] font-medium text-muted transition-colors hover:text-ink"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white transition-colors group-hover:bg-page/70">
            <ArrowLeft size={15} strokeWidth={1.8} />
          </span>

          <span>Back to tenants</span>
        </button>
      </div>

      {loading && <TenantSkeleton />}

      {error && (
        <div className="rounded-3xl border border-dashed border-line bg-panel px-5 py-12 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-page text-muted">
            <UserRound size={20} strokeWidth={1.7} />
          </div>

          <p className="mt-3 text-[13px] font-semibold text-ink">
            Couldn’t load this tenant
          </p>

          <p className="mt-1 text-[12px] text-muted">{error}</p>
        </div>
      )}

      {!loading && !error && tenant && (
        <>
          {/* Hero */}
          <section className="overflow-hidden rounded-[28px] bg-ink text-white shadow-[0_16px_40px_rgba(22,22,29,0.12)]">
            <div className="relative px-5 py-6 sm:px-7 sm:py-7">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet/20 blur-3xl" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <img
                    src={avatarUrl(String(tenant.id))}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-[20px] object-cover ring-1 ring-white/10 sm:h-[72px] sm:w-[72px]"
                  />

                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/60">
                        Tenant
                      </span>

                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-medium text-white/60">
                        ID #{tenant.id}
                      </span>
                    </div>

                    <h1 className="truncate text-[25px] font-bold tracking-[-0.03em] sm:text-[30px]">
                      {tenant.full_name}
                    </h1>

                    {tenant.phone && (
                      <p className="mt-1.5 text-[12.5px] text-white/45">
                        {tenant.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={tenant.status} />

                  <div className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10.5px] font-medium text-white/60">
                    {activeTenancies.length}{' '}
                    {activeTenancies.length === 1
                      ? 'active tenancy'
                      : 'active tenancies'}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-5">
              {/* Contact overview */}
              <section className="rounded-3xl border border-line bg-panel p-4 sm:p-5">
                <SectionHeading
                  eyebrow="Profile"
                  title="Contact details"
                />

                <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <ContactCard
                    icon={Phone}
                    label="Phone"
                    value={tenant.phone}
                  />

                  <ContactCard
                    icon={MessageSquare}
                    label="SMS notifications"
                    value={tenant.sms_opt_in ? 'Opted in' : 'Opted out'}
                    tone={tenant.sms_opt_in ? 'good' : 'neutral'}
                  />

                  <ContactCard
                    icon={Mail}
                    label="Email"
                    value={tenant.email}
                  />

                  <ContactCard
                    icon={MapPin}
                    label="Address"
                    value={tenant.address}
                  />
                </div>
              </section>

              {/* Emergency contact */}
              {(tenant.emergency_contact_name ||
                tenant.emergency_contact_phone) && (
                <section className="rounded-3xl border border-line bg-panel p-4 sm:p-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warn-bg text-warn-text">
                      <ShieldAlert size={15} strokeWidth={1.8} />
                    </div>

                    <div>
                      <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted">
                        Emergency
                      </p>

                      <h2 className="text-[15px] font-bold text-ink">
                        Emergency contact
                      </h2>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    <ContactValue
                      label="Name"
                      value={tenant.emergency_contact_name}
                    />

                    <ContactValue
                      label="Phone"
                      value={tenant.emergency_contact_phone}
                    />

                    <ContactValue
                      label="Relationship"
                      value={tenant.emergency_contact_relationship}
                    />
                  </div>
                </section>
              )}

              {/* Active tenancies */}
              <section className="rounded-3xl border border-line bg-panel p-4 sm:p-5">
                <div className="flex items-end justify-between gap-3">
                  <SectionHeading
                    eyebrow="Current"
                    title="Active tenancies"
                  />

                  <span className="rounded-full bg-good-bg px-2.5 py-1 text-[11px] font-semibold text-good-text">
                    {activeTenancies.length}
                  </span>
                </div>

                {activeTenancies.length === 0 && (
                  <div className="mt-5 rounded-2xl border border-dashed border-line bg-page/30 px-4 py-10 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-page text-muted">
                      <CalendarDays size={17} strokeWidth={1.8} />
                    </div>

                    <p className="mt-3 text-[12.5px] font-semibold text-ink">
                      No active tenancy
                    </p>

                    <p className="mt-1 text-[11.5px] text-muted">
                      This tenant currently has no active lease recorded.
                    </p>
                  </div>
                )}

                {activeTenancies.length > 0 && (
                  <div className="mt-5 space-y-2.5">
                    {activeTenancies.map((tenancy) => (
                      <button
                        key={tenancy.id}
                        type="button"
                        onClick={() =>
                          navigate(`/tenancies/${tenancy.id}`)
                        }
                        className="group flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-3.5 text-left transition-all hover:border-violet-soft hover:bg-violet-pale/20"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-pale text-violet">
                          <CalendarDays
                            size={16}
                            strokeWidth={1.8}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12.5px] font-semibold text-ink">
                            {tenancy.unit?.code ??
                              `Unit #${tenancy.unit_id}`}
                          </p>

                          <p className="mt-1 text-[11px] text-muted">
                            {formatDate(tenancy.start_date)}{' '}
                            <span className="px-1 text-ink/30">
                              →
                            </span>{' '}
                            {formatDate(tenancy.end_date)}
                          </p>
                        </div>

                        <LifecyclePill lifecycle={tenancy.lifecycle} />

                        <ChevronRight
                          size={14}
                          strokeWidth={1.8}
                          className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* Tenancy history */}
              <section className="rounded-3xl border border-line bg-panel p-4 sm:p-5">
                <SectionHeading
                  eyebrow="Timeline"
                  title="Tenancy history"
                />

                {historyLoading && (
                  <div className="mt-5 space-y-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-[68px] animate-pulse rounded-2xl bg-page"
                      />
                    ))}
                  </div>
                )}

                {!historyLoading && history.length === 0 && (
                  <div className="mt-5 rounded-2xl border border-dashed border-line bg-page/30 px-4 py-10 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-page text-muted">
                      <Clock3 size={17} strokeWidth={1.8} />
                    </div>

                    <p className="mt-3 text-[12.5px] font-semibold text-ink">
                      No tenancy history
                    </p>

                    <p className="mt-1 text-[11.5px] text-muted">
                      Previous and current tenancy records will appear here.
                    </p>
                  </div>
                )}

                {!historyLoading && history.length > 0 && (
                  <div className="relative mt-5">
                    <div className="absolute bottom-5 left-[18px] top-5 w-px bg-line" />

                    <div className="space-y-2.5">
                      {history.map((tenancy) => (
                        <button
                          key={tenancy.id}
                          type="button"
                          onClick={() =>
                            navigate(`/tenancies/${tenancy.id}`)
                          }
                          className="group relative flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-3.5 text-left transition-all hover:border-violet-soft hover:bg-violet-pale/20"
                        >
                          <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-violet shadow-sm">
                            <CalendarDays
                              size={14}
                              strokeWidth={1.8}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-center gap-2">
                              <p className="truncate text-[12.5px] font-semibold text-ink">
                                {tenancy.unit?.code ??
                                  `Unit #${tenancy.unit_id}`}
                              </p>

                              <span className="hidden text-[10.5px] text-muted sm:inline">
                                {tenancy.origin}
                              </span>
                            </div>

                            <p className="mt-1 text-[11px] text-muted">
                              {formatDate(tenancy.start_date)}{' '}
                              <span className="px-1 text-ink/30">
                                →
                              </span>{' '}
                              {formatDate(tenancy.end_date)}
                            </p>
                          </div>

                          <LifecyclePill
                            lifecycle={tenancy.lifecycle}
                          />

                          <ChevronRight
                            size={14}
                            strokeWidth={1.8}
                            className="hidden shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink sm:block"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Notes */}
            <aside className="min-w-0">
              <NotesPanel
                notableType="tenant"
                notableId={id}
              />
            </aside>
          </div>
        </>
      )}
    </div>
  )
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string
  title: string
}) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted">
        {eyebrow}
      </p>

      <h2 className="mt-0.5 text-[15px] font-bold tracking-[-0.01em] text-ink">
        {title}
      </h2>
    </div>
  )
}

function ContactCard({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
}: {
  icon: typeof Phone
  label: string
  value?: string | null
  tone?: 'neutral' | 'good'
}) {
  const iconClass =
    tone === 'good'
      ? 'bg-good-bg text-good-text'
      : 'bg-page text-ink/55'

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-page/55 px-3.5 py-3.5">
      <div
        className={[
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
          iconClass,
        ].join(' ')}
      >
        <Icon size={15} strokeWidth={1.8} />
      </div>

      <div className="min-w-0">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted">
          {label}
        </p>

        <p className="mt-1 truncate text-[12.5px] font-semibold text-ink">
          {value || '—'}
        </p>
      </div>
    </div>
  )
}

function ContactValue({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  return (
    <div className="rounded-2xl bg-page/55 px-3.5 py-3">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted">
        {label}
      </p>

      <p className="mt-1 text-[12.5px] font-semibold text-ink">
        {value || '—'}
      </p>
    </div>
  )
}

function formatDate(value?: string | null) {
  if (!value) return '—'

  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function TenantSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-[160px] animate-pulse rounded-[28px] bg-ink/10" />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <div className="h-[190px] animate-pulse rounded-3xl bg-page" />
          <div className="h-[170px] animate-pulse rounded-3xl bg-page" />
          <div className="h-[260px] animate-pulse rounded-3xl bg-page" />
          <div className="h-[320px] animate-pulse rounded-3xl bg-page" />
        </div>

        <div className="h-[300px] animate-pulse rounded-3xl bg-page" />
      </div>
    </div>
  )
}