import type { TenancySummary } from '../../types'

/** The most urgent expiring lease, shown the way the Sale card was in the original design. */
export default function ActivityHighlightCard({ tenancy }: { tenancy: TenancySummary }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center pt-1">
        <span className="text-[11px] leading-tight text-muted text-center">
          {tenancy.end_date}
        </span>
      </div>

      <div className="flex-1 overflow-hidden rounded-2xl border border-line">
        <div className="relative h-24 w-full bg-gradient-to-br from-slate-700 to-slate-900">
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[11px] font-medium text-ink">
            Expiring
          </span>
        </div>
        <div className="space-y-2 bg-white p-3">
          <div>
            <p className="text-[13px] font-semibold text-ink">{tenancy.tenant?.full_name ?? 'Tenant'}</p>
            <p className="text-[11.5px] text-muted">
              Unit {tenancy.unit?.code ?? '—'} · {tenancy.days_until_expiry ?? '—'} day(s) left
            </p>
          </div>
          <span className="inline-flex rounded-full border border-line px-2.5 py-1 text-[11px] text-ink/70">
            Lease ends {tenancy.end_date}
          </span>
        </div>
      </div>
    </div>
  )
}
