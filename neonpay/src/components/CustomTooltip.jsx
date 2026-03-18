import { formatCurrency } from '../utils/finance'

export default function CustomTooltip({ active, payload, label, currency = 'USD' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card p-3 text-sm min-w-[140px]">
      {label && <p className="text-gray-400 text-xs mb-2 font-medium">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color || entry.fill }} />
            <span className="text-gray-300 capitalize">{entry.name}</span>
          </div>
          <span className="font-semibold text-white font-mono">{formatCurrency(entry.value, currency)}</span>
        </div>
      ))}
    </div>
  )
}
