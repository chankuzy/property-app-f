import { Hash } from 'lucide-react'

export default function PipelineTooltip({ title, detail, count }: { title: string; detail: string; count: number }) {
  return (
    <div className="animate-scale-in w-52 origin-bottom rounded-2xl border border-line bg-white p-4 shadow-[0_12px_28px_rgba(20,18,45,0.12)]">
      <p className="text-[12.5px] font-semibold text-ink">{title}</p>

      <p className="mt-3 text-[11px] text-muted">Count</p>
      <div className="mt-1 flex items-center gap-1.5 text-[14px] font-semibold text-ink">
        <Hash size={14} strokeWidth={2} className="text-ink/60" />
        {count}
      </div>

      <p className="mt-3 text-[11px] leading-snug text-muted">{detail}</p>
    </div>
  )
}