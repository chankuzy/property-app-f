export default function StatusPill({ status }: { status: 'active' | 'inactive' }) {
  const styles = status === 'active' ? 'bg-good-bg text-good-text' : 'bg-warn-bg text-warn-text'

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium capitalize ${styles}`}>
      {status}
    </span>
  )
}
