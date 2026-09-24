import { Phone, ExternalLink, Mail } from 'lucide-react'
import { avatarUrl } from '../../lib/avatar'
import type { ActivityLogEntry, NotificationLogEntry } from '../../types'

type Item =
  | { kind: 'activity'; entry: ActivityLogEntry }
  | { kind: 'reminder'; entry: NotificationLogEntry }

export default function QuickConnectRow({ item }: { item: Item }) {
  const isActivity = item.kind === 'activity'
  const name = isActivity ? (item.entry.user?.name ?? 'System') : (item.entry.tenant?.full_name ?? 'Tenant')
  const detail = isActivity ? item.entry.description : (item.entry.message ?? item.entry.type)
  const seed = isActivity ? `staff-${item.entry.user?.id ?? 0}` : `tenant-${item.entry.tenant?.id ?? 0}`
  const time = new Date(item.entry.created_at)
  const timeLabel = Number.isNaN(time.getTime())
    ? ''
    : time.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center pt-1">
        <span className="text-[11px] leading-tight text-muted text-center">{timeLabel}</span>
      </div>

      <div className="flex-1 rounded-2xl border border-line bg-white p-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <img src={avatarUrl(seed)} alt="" className="h-9 w-9 rounded-full object-cover" />
            <div>
              <p className="text-[13px] font-semibold text-ink">{name}</p>
              <p className="text-[12px] text-muted">{isActivity ? 'Office activity' : 'SMS reminder'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-muted">
            <button className="flex h-7 w-7 items-center justify-center rounded-full border border-line hover:bg-page/70">
              {isActivity ? <Mail size={13} strokeWidth={1.8} /> : <Phone size={13} strokeWidth={1.8} />}
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-full border border-line hover:bg-page/70">
              <ExternalLink size={13} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <div className="mt-3">
          <span className="line-clamp-2 rounded-full border border-line px-2.5 py-1 text-[11px] text-ink/70">
            {detail}
          </span>
        </div>
      </div>
    </div>
  )
}
