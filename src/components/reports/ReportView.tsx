// src/components/reports/ReportView.tsx
/**
 * Renders an arbitrary report payload without assuming its shape.
 * Each object entry is classified as:
 *  - scalar   -> a summary stat card
 *  - table    -> a real array of objects, or a Laravel keyBy()-style
 *                object-of-objects (e.g. {"due_soon": {...}, "overdue": {...}})
 *  - group    -> a plain object mixing scalars and/or sub-objects
 *                (rendered as its own labelled sub-section, recursively)
 * Recursion is capped at a few levels; anything deeper falls back to raw JSON.
 */
export default function ReportView({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null
  const entries = Object.entries(data)
  if (entries.length === 0) return <p className="py-8 text-center text-[13px] text-muted">No data returned.</p>
  return <>{renderEntries(entries, 0)}</>
}

type Classification = 'scalar' | 'table' | 'group'

function classify(v: unknown): Classification {
  if (v === null || v === undefined || typeof v !== 'object') return 'scalar'
  if (Array.isArray(v)) {
    if (v.length === 0) return 'scalar'
    return v[0] !== null && typeof v[0] === 'object' ? 'table' : 'scalar'
  }
  const objEntries = Object.entries(v as Record<string, unknown>)
  if (objEntries.length === 0) return 'scalar'
  const allObjects = objEntries.every(([, val]) => val !== null && typeof val === 'object' && !Array.isArray(val))
  return allObjects ? 'table' : 'group'
}

function renderEntries(entries: [string, unknown][], depth: number): React.ReactNode {
  const scalarEntries = entries.filter(([, v]) => classify(v) === 'scalar')
  const tableEntries = entries
    .filter(([, v]) => classify(v) === 'table')
    .map(([k, v]) => [k, toRows(v)] as const)
    .filter((e): e is [string, Record<string, unknown>[]] => e[1] !== null)
  const groupEntries = entries.filter(([, v]) => classify(v) === 'group')

  const showLabels = tableEntries.length + groupEntries.length > 1 || (scalarEntries.length > 0 && (tableEntries.length > 0 || groupEntries.length > 0))

  return (
    <>
      {scalarEntries.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {scalarEntries.map(([key, value]) => (
            <div key={key} className="rounded-2xl border border-line bg-white p-3.5">
              <p className="text-[11px] capitalize text-muted">{key.replace(/_/g, ' ')}</p>
              <p className="mt-1 text-[16px] font-semibold text-ink">{formatScalar(value)}</p>
            </div>
          ))}
        </div>
      )}

      {tableEntries.map(([key, rows]) => {
        const columns = rows.length > 0 ? Object.keys(rows[0]) : []
        return (
          <div key={key} className="mt-4">
            {showLabels && <p className="mb-2 text-[12.5px] font-semibold text-ink/70">{humanizeKey(key)}</p>}
            <div className="no-scrollbar overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[480px] border-collapse text-left">
                <thead>
                  <tr className="bg-page/60 text-[12px] font-medium text-muted">
                    {columns.map((col) => (
                      <th key={col} className="px-3.5 py-2.5 font-medium capitalize">
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-t border-line/80 text-[13px] text-ink/80">
                      {columns.map((col) => (
                        <td key={col} className="px-3.5 py-2.5">
                          {formatCell(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {groupEntries.map(([key, value]) => {
        const nested = Object.entries(value as Record<string, unknown>)
        return (
          <div key={key} className="mt-4">
            {showLabels && <p className="mb-2 text-[12.5px] font-semibold text-ink/70">{humanizeKey(key)}</p>}
            {depth < 3 ? (
              renderEntries(nested, depth + 1)
            ) : (
              <pre className="no-scrollbar max-h-72 overflow-auto rounded-2xl border border-dashed border-line bg-page/40 p-4 text-[11.5px] text-ink/70">
                {JSON.stringify(value, null, 2)}
              </pre>
            )}
          </div>
        )
      })}
    </>
  )
}

/**
 * Normalizes either a real JSON array of objects, or a Laravel keyBy()-style
 * object whose values are all objects, into a plain array of row objects.
 * When the object's own keys are meaningful (non-numeric) labels not already
 * present as a field on the row, that label is surfaced as a leading column.
 */
function toRows(v: unknown): Record<string, unknown>[] | null {
  if (Array.isArray(v)) {
    return v.length > 0 && typeof v[0] === 'object' && v[0] !== null ? (v as Record<string, unknown>[]) : null
  }
  if (v !== null && typeof v === 'object') {
    const objEntries = Object.entries(v as Record<string, unknown>)
    const isRowShaped =
      objEntries.length > 0 &&
      objEntries.every(([, val]) => val !== null && typeof val === 'object' && !Array.isArray(val))
    if (!isRowShaped) return null
    return objEntries.map(([key, val]) => {
      const row = val as Record<string, unknown>
      const isNumericIndex = /^\d+$/.test(key)
      const alreadyLabelled = 'label' in row || 'name' in row
      return !isNumericIndex && !alreadyLabelled ? { label: humanizeKey(key), ...row } : row
    })
  }
  return null
}

function humanizeKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

/** For summary-card scalars: simple, no object drill-down expected here. */
function formatScalar(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return value.toLocaleString()
  if (Array.isArray(value)) return value.length === 0 ? 'None' : `${value.length} item${value.length === 1 ? '' : 's'}`
  if (typeof value === 'object') return Object.keys(value as object).length === 0 ? 'None' : formatObjectCompact(value as Record<string, unknown>)
  return String(value)
}

/** For table cells: tries to make common nested-object shapes human-readable. */
function formatCell(value: unknown): React.ReactNode {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return value.toLocaleString()
  if (Array.isArray(value)) {
    if (value.length === 0) return '—'
    if (value.every((x) => x === null || typeof x !== 'object')) {
      return value.length > 3 ? `${value.slice(0, 3).join(', ')} +${value.length - 3} more` : value.join(', ')
    }
    return `${value.length} item${value.length === 1 ? '' : 's'}`
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (typeof obj.name === 'string') return obj.id !== undefined ? `${obj.name} (#${String(obj.id)})` : obj.name
    if (typeof obj.label === 'string') return obj.label
    if (typeof obj.type === 'string' && obj.id !== undefined) return `${obj.type} #${String(obj.id)}`
    const compact = formatObjectCompact(obj)
    return (
      <span title={JSON.stringify(value, null, 2)} className="cursor-help underline decoration-dotted">
        {compact}
      </span>
    )
  }
  return String(value)
}

function formatObjectCompact(obj: Record<string, unknown>): string {
  const entries = Object.entries(obj).slice(0, 2)
  const preview = entries.map(([k, v]) => `${k}: ${typeof v === 'object' && v !== null ? '…' : String(v)}`).join(', ')
  const extra = Object.keys(obj).length > 2 ? ', …' : ''
  return `{ ${preview}${extra} }`
}
