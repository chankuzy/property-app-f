import { Search, SlidersHorizontal } from 'lucide-react'
import { useDashboard } from '../../hooks/useDashboard'
import { useRecentActivity, useRecentTenantReminders } from '../../hooks/useActivity'
import ActivityHighlightCard from './ActivityHighlightCard'
import QuickConnectRow from './QuickConnectRow'

export default function QuickConnectsPanel() {
  const { data: summary } = useDashboard()
  const { data: activity, loading: activityLoading } = useRecentActivity()
  const { data: reminders, loading: remindersLoading } = useRecentTenantReminders()

  const featured = summary?.tenancies.expiring[0]
  const loading = activityLoading || remindersLoading

  const rows = [
    ...(activity ?? []).map((entry) => ({ kind: 'activity' as const, entry })),
    ...(reminders ?? []).map((entry) => ({ kind: 'reminder' as const, entry })),
  ]
    .sort((a, b) => new Date(b.entry.created_at).getTime() - new Date(a.entry.created_at).getTime())
    .slice(0, 6)

  return (
    <aside className="animate-fade-up flex w-full flex-col rounded-3xl border border-line bg-panel p-4 sm:p-5 lg:w-[340px] lg:shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-ink">Recent Activity</h2>
        <div className="flex items-center gap-2">
          <button className="flex h-8 w-8 items-center justify-center rounded-full border border-line transition-colors hover:bg-page/60">
            <Search size={14} strokeWidth={2} className="text-ink/60" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full border border-line transition-colors hover:bg-page/60">
            <SlidersHorizontal size={13} strokeWidth={2} className="text-ink/60" />
          </button>
        </div>
      </div>

      <div className="no-scrollbar mt-4 max-h-[520px] flex-1 space-y-4 overflow-y-auto pr-1 lg:max-h-none">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-page" />
            ))}
          </div>
        )}

        {!loading && featured && <ActivityHighlightCard tenancy={featured} />}

        {!loading &&
          rows.map((item, i) => (
            <div key={`${item.kind}-${item.entry.id}-${i}`} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <QuickConnectRow item={item} />
            </div>
          ))}

        {!loading && rows.length === 0 && !featured && (
          <p className="py-8 text-center text-[13px] text-muted">No recent activity yet.</p>
        )}
      </div>
    </aside>
  )
}