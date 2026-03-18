import { formatCurrency } from '../utils/finance'

export default function CustomTooltip({ active, payload, label, currency = 'USD' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card p-3 text-sm min-w-[140px]">
      {label && <p className="text-xs mb-2 font-medium" style={{ color: 'var(--text-sub)' }}>{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color || entry.fill }} />
            <span className="capitalize" style={{ color: 'var(--text-sub)' }}>{entry.name}</span>
          </div>
          <span className="font-semibold font-mono" style={{ color: 'var(--text)' }}>{formatCurrency(entry.value, currency)}</span>
        </div>
      ))}
    </div>
  )
}
