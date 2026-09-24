// src/components/pipeline/PipelineChart.tsx
import { useMemo, useState } from 'react'
import { ChevronDown, SlidersHorizontal, Plus } from 'lucide-react'
import { useDashboard } from '../../hooks/useDashboard'
import { useRoute } from '../../lib/router'
import PipelineTooltip from './PipelineTooltip'
import type { DashboardSummary } from '../../types'

const CHART_HEIGHT = 220

interface Bar {
  label: string
  value: number
  count: number
  detail: string
  tone: 'default' | 'warn' | 'good'
}

function buildBars(summary: DashboardSummary): Bar[] {
  const { totals, rent, tenancies } = summary
  const counts = [
    totals.vacant_units,
    totals.reserved_units,
    totals.occupied_units,
    totals.maintenance_units,
    rent.due_soon.count,
    rent.due_today.count,
    rent.overdue.count,
    tenancies.expiring_count,
  ]
  const max = Math.max(1, ...counts)

  const rows: Array<Omit<Bar, 'value' | 'count'> & { value: number }> = [
    { label: 'Vacant', value: totals.vacant_units, tone: 'default', detail: `${totals.vacant_units} unit(s) ready to let` },
    { label: 'Reserved', value: totals.reserved_units, tone: 'default', detail: `${totals.reserved_units} unit(s) starting soon` },
    { label: 'Occupied', value: totals.occupied_units, tone: 'good', detail: `${totals.occupied_units} unit(s) currently let` },
    { label: 'Maintenance', value: totals.maintenance_units, tone: 'default', detail: `${totals.maintenance_units} unit(s) under maintenance` },
    { label: 'Rent due soon', value: rent.due_soon.count, tone: 'default', detail: `${rent.due_soon.balance} outstanding` },
    { label: 'Rent due today', value: rent.due_today.count, tone: 'warn', detail: `${rent.due_today.balance} outstanding` },
    { label: 'Rent overdue', value: rent.overdue.count, tone: 'warn', detail: `${rent.overdue.balance} outstanding` },
    { label: 'Leases expiring', value: tenancies.expiring_count, tone: 'warn', detail: `within the next 60 days` },
  ]

  return rows.map((b) => ({ ...b, count: b.value, value: Math.round((b.value / max) * 100) }))
}

export default function PipelineChart() {
  const { navigate } = useRoute()
  const { data: summary, loading, error } = useDashboard()

  // hoveredIndex drives the tooltip only — it's null whenever the pointer
  // isn't literally over a bar, so the tooltip can never get stuck open.
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  // selectedIndex drives which bar reads as "active" in color/legend — a
  // separate, persistent choice, not tied to hover at all.
  const [selectedIndex, setSelectedIndex] = useState(0)

  const bars = useMemo(() => (summary ? buildBars(summary) : []), [summary])
  const highlighted = hoveredIndex ?? selectedIndex

  return (
    <section className="animate-fade-up rounded-3xl border border-line bg-panel p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-ink">Pipeline Performance Analytics</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-[13px] font-medium text-ink/80 transition-colors hover:bg-page/60">
            This month
            <ChevronDown size={14} strokeWidth={2} />
          </button>
          <button className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-[13px] font-medium text-ink/80 transition-colors hover:bg-page/60">
            Filter
            <SlidersHorizontal size={13} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => navigate('/tenants/new')}
            className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-ink/90 active:scale-95"
          >
            Add Tenant
            <Plus size={14} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {loading && <ChartSkeleton />}
      {error && <ChartError message={error} />}

      {!loading && !error && bars.length > 0 && (
        <>
          <div className="relative mt-10">
            <div className="flex items-end gap-1.5 sm:gap-2" style={{ height: CHART_HEIGHT }}>
              {bars.map((bar, i) => (
                <div
                  key={bar.label}
                  className="relative flex h-full flex-1 flex-col items-center justify-end"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <span className="mb-2 text-[12px] font-medium text-ink/70">{bar.count}</span>

                  <div
                    className="w-full rounded-t-2xl transition-[height,background-color] duration-500 ease-out"
                    style={{
                      height: `${Math.max(bar.value, 4)}%`,
                      background:
                        i === highlighted
                          ? 'var(--color-violet-bar)'
                          : bar.tone === 'warn'
                            ? '#fbe3cf'
                            : 'var(--color-violet-pale)',
                    }}
                  />

                  {i < bars.length - 1 && <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-line/70" />}

                  {/* Only in the DOM while actually hovered — can't linger. */}
                  {i === hoveredIndex && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-[70] mb-3 -translate-x-1/2">
                      <PipelineTooltip title={bar.label} detail={bar.detail} count={bar.count} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-y-2 border-t border-line pt-4 sm:grid-cols-8">
            {bars.map((bar, i) => (
              <button
                key={bar.label}
                type="button"
                onClick={() => setSelectedIndex(i)}
                className={[
                  'truncate text-center text-[11.5px] transition-colors sm:text-[12.5px]',
                  i === selectedIndex ? 'font-semibold text-ink' : 'text-muted hover:text-ink/70',
                ].join(' ')}
              >
                {bar.label}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function ChartSkeleton() {
  return (
    <div className="mt-6 flex items-end gap-3" style={{ height: CHART_HEIGHT }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex-1 animate-pulse rounded-t-2xl bg-page" style={{ height: `${30 + (i % 4) * 15}%` }} />
      ))}
    </div>
  )
}

function ChartError({ message }: { message: string }) {
  return (
    <div className="mt-6 flex h-[220px] items-center justify-center rounded-2xl border border-dashed border-line text-[13px] text-muted">
      {message}
    </div>
  )
}
