// src/components/reports/ReportPanel.tsx
import { api } from '../../lib/api'
import { useApiResource } from '../../hooks/useApiResource'

type Query = Record<string, string | number | boolean | undefined>

function formatLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function isPlainRow(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  if (Array.isArray(v)) return `${v.length} item(s)`
  if (isPlainRow(v)) return JSON.stringify(v)
  return String(v)
}

export default function ReportPanel({ path, query }: { path: string; query?: Query }) {
  const { data, loading, error } = useApiResource<unknown>(
    () => api.get<unknown>(path, query),
    [path, JSON.stringify(query ?? {})],
  )

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-page" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="py-8 text-center text-[13px] text-muted">{error}</p>
  }

  const payload = data as Record<string, unknown> | unknown[] | null
  const rows: Record<string, unknown>[] | null = Array.isArray(payload)
    ? (payload as Record<string, unknown>[])
    : isPlainRow(payload) && Array.isArray((payload as Record<string, unknown>).data)
      ? ((payload as Record<string, unknown>).data as Record<string, unknown>[])
      : null

  if (rows) {
    if (rows.length === 0) {
      return <p className="py-8 text-center text-[13px] text-muted">No data for this report.</p>
    }
    const columns = Object.keys(rows[0]).filter((k) => !isPlainRow(rows[0][k]))
    return (
      <div className="no-scrollbar overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="text-[12px] font-medium text-muted">
              {columns.map((c) => (
                <th key={c} className="pb-3 pr-4 font-medium">
                  {formatLabel(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-line/80 text-[13.5px] transition-colors hover:bg-page/40">
                {columns.map((c) => (
                  <td key={c} className="py-3 pr-4 text-ink/80">
                    {formatValue(row[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const summary = isPlainRow(payload) ? (payload.data as unknown) ?? payload : null
  if (isPlainRow(summary)) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(summary).map(([key, value]) => (
          <div key={key} className="rounded-2xl border border-line bg-white p-4">
            <p className="text-[11.5px] font-medium uppercase tracking-wide text-muted">{formatLabel(key)}</p>
            {isPlainRow(value) ? (
              <div className="mt-2 space-y-1">
                {Object.entries(value).map(([k2, v2]) => (
                  <div key={k2} className="flex items-center justify-between text-[13px]">
                    <span className="text-ink/60">{formatLabel(k2)}</span>
                    <span className="font-medium text-ink">{formatValue(v2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-1.5 text-[17px] font-semibold text-ink">{formatValue(value)}</p>
            )}
          </div>
        ))}
      </div>
    )
  }

  return <p className="py-8 text-center text-[13px] text-muted">Unrecognized response shape — paste a sample and I'll build a proper view.</p>
}
