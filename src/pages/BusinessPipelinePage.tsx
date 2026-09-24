import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  CalendarClock,
  ChevronRight,
  Clock3,
  Home,
  Plus,
  Users,
  Wallet,
} from 'lucide-react'
import { ResponsivePie } from '@nivo/pie'
import { useDashboard } from '../hooks/useDashboard'
import { useRoute } from '../lib/router'

function money(value: unknown) {
  if (value === null || value === undefined || value === '') return '₦0'

  const raw = String(value)

  if (raw.includes('₦')) return raw

  const numeric = Number(raw.replace(/,/g, ''))

  if (Number.isNaN(numeric)) return raw

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(numeric)
}

function date(value?: string | null) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function initials(name?: string | null) {
  if (!name) return '?'

  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: string | number
  detail?: string
  icon: typeof Building2
}) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-5 shadow-[0_1px_2px_rgba(0,0,0,.03)]">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-page text-ink">
          <Icon size={19} strokeWidth={1.8} />
        </div>

        <ArrowUpRight size={16} className="text-muted" />
      </div>

      <div className="mt-7">
        <p className="text-[12px] font-medium uppercase tracking-[.08em] text-muted">
          {label}
        </p>

        <p className="mt-1 text-[28px] font-semibold tracking-[-.04em] text-ink">
          {value}
        </p>

        {detail && (
          <p className="mt-1 text-xs text-muted">
            {detail}
          </p>
        )}
      </div>
    </div>
  )
}

function AttentionItem({
  tone,
  icon: Icon,
  title,
  detail,
  onClick,
}: {
  tone: 'danger' | 'warning' | 'violet'
  icon: typeof AlertCircle
  title: string
  detail: string
  onClick: () => void
}) {
  const styles = {
    danger: {
      icon: 'bg-[#fff0ef] text-[#d85d56]',
      dot: 'bg-[#d85d56]',
    },
    warning: {
      icon: 'bg-warn-bg text-warn-text',
      dot: 'bg-warn-text',
    },
    violet: {
      icon: 'bg-violet-pale text-violet',
      dot: 'bg-violet',
    },
  }[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-page"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
          <p className="truncate text-sm font-semibold text-ink">
            {title}
          </p>
        </div>

        <p className="mt-0.5 truncate text-xs text-muted">
          {detail}
        </p>
      </div>

      <ChevronRight
        size={16}
        className="shrink-0 text-muted transition group-hover:translate-x-0.5"
      />
    </button>
  )
}

export default function BusinessPipelinePage() {
  const { data, loading } = useDashboard()
  const { navigate } = useRoute()

  if (loading || !data) {
    return (
      <div className="space-y-5">
        <div className="h-24 animate-pulse rounded-2xl bg-panel" />

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-2xl bg-panel"
            />
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-[430px] animate-pulse rounded-2xl bg-panel" />
          <div className="h-[430px] animate-pulse rounded-2xl bg-panel" />
        </div>
      </div>
    )
  }

  const totalUnits = data.totals.units || 0

  const occupancy =
    totalUnits > 0
      ? Math.round((data.totals.occupied_units / totalUnits) * 100)
      : 0

  const occupancyData = [
    {
      id: 'Occupied',
      label: 'Occupied',
      value: data.totals.occupied_units,
    },
    {
      id: 'Vacant',
      label: 'Vacant',
      value: data.totals.vacant_units,
    },
    {
      id: 'Reserved',
      label: 'Reserved',
      value: data.totals.reserved_units,
    },
    {
      id: 'Maintenance',
      label: 'Maintenance',
      value: data.totals.maintenance_units,
    },
  ].filter((item) => item.value > 0)

  const attentionCount =
    data.rent.overdue.count +
    data.rent.due_today.count +
    data.tenancies.expiring_count +
    data.tenancies.expired_open_count

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.12em] text-violet">
            Portfolio overview
          </p>

          <h1 className="mt-1 text-[30px] font-semibold tracking-[-.045em] text-ink">
            Good morning
          </h1>

          <p className="mt-1 text-sm text-muted">
            Here's what needs your attention across the portfolio.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/tenants/new')}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          <Plus size={17} />
          Add tenant
        </button>
      </section>

      {/* KPI strip */}
      <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Properties"
          value={data.totals.properties}
          detail="Across your portfolio"
          icon={Building2}
        />

        <StatCard
          label="Total units"
          value={data.totals.units}
          detail={`${data.totals.vacant_units} currently vacant`}
          icon={Home}
        />

        <StatCard
          label="Occupancy"
          value={`${occupancy}%`}
          detail={`${data.totals.occupied_units} occupied units`}
          icon={ArrowUpRight}
        />

        <StatCard
          label="Active tenants"
          value={data.totals.active_tenants}
          detail="Currently renting"
          icon={Users}
        />
      </section>

      {/* Main command center */}
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_370px]">
        {/* Money + occupancy */}
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,.75fr)]">
            {/* Collection */}
            <div className="overflow-hidden rounded-2xl border border-line bg-ink p-6 text-white shadow-[0_12px_40px_rgba(20,20,30,.08)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-white/50">
                    Rent collected
                  </p>

                  <p className="mt-3 text-[38px] font-semibold tracking-[-.05em]">
                    {money(data.rent.collected_this_month)}
                  </p>

                  <p className="mt-1 text-sm text-white/50">
                    Collected this month
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <Wallet size={20} />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 divide-x divide-white/10">
                <div className="pr-4">
                  <p className="text-[11px] uppercase tracking-wide text-white/40">
                    Due today
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {money(data.rent.due_today.balance)}
                  </p>
                </div>

                <div className="px-4">
                  <p className="text-[11px] uppercase tracking-wide text-white/40">
                    Due soon
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {money(data.rent.due_soon.balance)}
                  </p>
                </div>

                <div className="pl-4">
                  <p className="text-[11px] uppercase tracking-wide text-white/40">
                    Overdue
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#ffaaa4]">
                    {money(data.rent.overdue.balance)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/rent-charges')}
                className="mt-7 inline-flex items-center gap-1 text-sm font-medium text-white/70 transition hover:text-white"
              >
                View rent charges
                <ChevronRight size={15} />
              </button>
            </div>

            {/* Occupancy chart */}
            <div className="rounded-2xl border border-line bg-panel p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[.1em] text-muted">
                    Occupancy
                  </p>
                  <p className="mt-1 text-xl font-semibold tracking-[-.03em] text-ink">
                    Portfolio health
                  </p>
                </div>

                <span className="rounded-full bg-good-bg px-2.5 py-1 text-xs font-semibold text-good-text">
                  {occupancy}% occupied
                </span>
              </div>

              <div className="relative mt-2 h-[205px]">
                {occupancyData.length > 0 ? (
                  <ResponsivePie
                    data={occupancyData}
                    innerRadius={0.7}
                    padAngle={2}
                    cornerRadius={5}
                    activeOuterRadiusOffset={5}
                    borderWidth={0}
                    enableArcLabels={false}
                    enableArcLinkLabels={false}
                    colors={[
                      '#7c6cf0',
                      '#d9d4fb',
                      '#cabffb',
                      '#8b8a97',
                    ]}
                    motionConfig="gentle"
                    tooltip={({ datum }) => (
                      <div className="rounded-lg border border-line bg-panel px-3 py-2 text-xs shadow-lg">
                        <strong>{datum.label}</strong>: {datum.value}
                      </div>
                    )}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted">
                    No unit data yet
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[32px] font-semibold tracking-[-.05em] text-ink">
                    {occupancy}%
                  </span>
                  <span className="text-xs text-muted">
                    occupied
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {occupancyData.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        background:
                          [
                            '#7c6cf0',
                            '#d9d4fb',
                            '#cabffb',
                            '#8b8a97',
                          ][index],
                      }}
                    />
                    <span className="text-xs text-muted">
                      {item.label}
                    </span>
                    <span className="ml-auto text-xs font-semibold text-ink">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Attention rail */}
        <aside className="rounded-2xl border border-line bg-panel p-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[.1em] text-muted">
                Attention
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-[-.03em] text-ink">
                Needs action
              </h2>
            </div>

            <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-page px-2 text-xs font-semibold text-ink">
              {attentionCount}
            </span>
          </div>

          <div className="mt-4 space-y-1">
            <AttentionItem
              tone="danger"
              icon={AlertCircle}
              title={`${data.rent.overdue.count} overdue rent`}
              detail={`${money(data.rent.overdue.balance)} outstanding`}
              onClick={() => navigate('/rent-charges')}
            />

            <AttentionItem
              tone="warning"
              icon={Clock3}
              title={`${data.rent.due_today.count} due today`}
              detail={`${money(data.rent.due_today.balance)} due now`}
              onClick={() => navigate('/rent-charges')}
            />

            <AttentionItem
              tone="violet"
              icon={CalendarClock}
              title={`${data.tenancies.expiring_count} leases expiring`}
              detail="Tenancies approaching their end date"
              onClick={() => navigate('/tenancies')}
            />

            <AttentionItem
              tone="danger"
              icon={AlertCircle}
              title={`${data.tenancies.expired_open_count} expired leases`}
              detail="Tenancies that need follow-up"
              onClick={() => navigate('/tenancies')}
            />
          </div>

          <div className="mt-4 border-t border-line pt-4">
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="flex w-full items-center justify-between rounded-xl bg-page px-3.5 py-3 text-sm font-semibold text-ink transition hover:bg-violet-pale"
            >
              Open reports
              <ArrowUpRight size={16} />
            </button>
          </div>
        </aside>
      </section>

      {/* Expiring tenancies */}
      <section className="rounded-2xl border border-line bg-panel">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.1em] text-muted">
              Lease management
            </p>

            <h2 className="mt-1 text-lg font-semibold tracking-[-.025em] text-ink">
              Expiring tenancies
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate('/tenancies')}
            className="text-xs font-semibold text-violet transition hover:opacity-70"
          >
            View all
          </button>
        </div>

        {data.tenancies.expiring.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-page">
              <CalendarClock size={19} className="text-muted" />
            </div>

            <p className="mt-3 text-sm font-semibold text-ink">
              No upcoming expiries
            </p>

            <p className="mt-1 text-xs text-muted">
              You're clear for now.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {data.tenancies.expiring.map((tenancy) => (
              <button
                type="button"
                key={tenancy.id}
                onClick={() => navigate(`/tenancies/${tenancy.id}`)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-page"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-pale text-xs font-bold text-violet">
                  {initials(tenancy.tenant?.full_name)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {tenancy.tenant?.full_name || 'Unknown tenant'}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-muted">
                    {tenancy.unit?.property || 'Property'} ·{' '}
                    {tenancy.unit?.code || 'Unit'}
                  </p>
                </div>

                <div className="hidden text-right sm:block">
                  <p className="text-xs font-medium text-muted">
                    Ends
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-ink">
                    {date(tenancy.end_date)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2 rounded-full bg-warn-bg px-2.5 py-1 text-xs font-semibold text-warn-text">
                  {tenancy.days_until_expiry}d
                </div>

                <ChevronRight size={16} className="shrink-0 text-muted" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Recent activity */}
      {data.recent_activity && data.recent_activity.length > 0 && (
        <section className="rounded-2xl border border-line bg-panel">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[.1em] text-muted">
                Activity
              </p>

              <h2 className="mt-1 text-lg font-semibold tracking-[-.025em] text-ink">
                Recent activity
              </h2>
            </div>
          </div>

          <div className="divide-y divide-line">
            {data.recent_activity.slice(0, 6).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 px-5 py-3.5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-page text-xs font-semibold text-muted">
                  {initials(activity.user?.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">
                    {activity.description || activity.action}
                  </p>

                  <p className="mt-0.5 text-xs text-muted">
                    {activity.user?.name || 'System'}
                  </p>
                </div>

                {activity.created_at && (
                  <time className="shrink-0 text-xs text-muted">
                    {date(activity.created_at)}
                  </time>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
