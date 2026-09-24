import type { TenancyLifecycle } from '../../types'

const styles: Record<TenancyLifecycle, string> = {
  active: 'bg-good-bg text-good-text',
  upcoming: 'bg-violet-pale text-violet',
  expiring: 'bg-warn-bg text-warn-text',
  expired: 'bg-rose-50 text-rose-600',
  renewed: 'bg-page text-ink/60',
  transferred: 'bg-page text-ink/60',
  terminated: 'bg-page text-ink/60',
}

export default function LifecyclePill({ lifecycle }: { lifecycle: TenancyLifecycle }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium capitalize ${styles[lifecycle]}`}>
      {lifecycle}
    </span>
  )
}
